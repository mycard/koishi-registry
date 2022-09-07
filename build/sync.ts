import Scanner, { AnalyzedPackage, Registry, SearchObject, SearchResult } from '../src'
import { bundle, locateEntry, prepare, sharedDeps } from './bundle'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'
import { Dict, pick, Time, valueMap } from 'cosmokit'
import { marked } from 'marked'
import { resolve } from 'path'
import kleur from 'kleur'
import axios from 'axios'
import pMap from 'p-map'
import { maxSatisfying } from 'semver'

const version = 3

async function getLegacy(dirname: string) {
  await mkdir(dirname + '/modules', { recursive: true })
  try {
    return require(dirname) as SearchResult
  } catch {
    return { total: 0, objects: [], time: '1970-01-01T00:00:00Z' }
  }
}

const BASE_URL = 'https://registry.npmjs.com'

function makeDict(objects: SearchObject[]) {
  const dict: Dict<SearchObject> = Object.create(null)
  for (const object of objects) {
    dict[object.package.name] = object
  }
  return dict
}

interface PackagePhobia {
  publishSize: number
  installSize: number
}

async function getSizeInfo(name: string) {
  const { data } = await axios.get('https://packagephobia.com/api.json?p=' + name)
  return data as PackagePhobia
}

interface NuxtPackage {
  version: string
  license: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  downloads: {
    lastMonth: number
  }
}

async function getDownloads(name: string) {
  const { data } = await axios.get<NuxtPackage>('https://api.nuxtjs.org/api/npm/package/' + name)
  return data.downloads
}

function softmax(x: number) {
  const t = Math.exp(-x)
  return (1 - t) / (1 + t)
}

type Subjects = 'maintenance' | 'popularity' | 'quality'

const insecureDeps = [
  'koishi-thirdeye',
]

const additional = [
  'koishi-plugin-dialogue',
  'koishi-plugin-dice',
  'koishi-plugin-github',
  'koishi-plugin-gocqhttp',
  'koishi-plugin-puppeteer',
  'koishi-plugin-screenshot',
]

const weights: Record<Subjects, number> = {
  maintenance: 0.2,
  popularity: 0.5,
  quality: 0.3,
}

const evaluators: Record<Subjects, (item: AnalyzedPackage, object: SearchObject) => Promise<number>> = {
  async maintenance(item, object) {
    if (item.verified) return 1
    const meta = item.versions[item.version]
    if (insecureDeps.some(name => meta.dependencies?.[name])) return 0
    return object.portable ? 0.75 : 0.5
  },
  async popularity(item, object) {
    const downloads = await getDownloads(item.name)
    item.downloads = object.downloads = downloads
    return softmax(downloads.lastMonth / 200)
  },
  async quality(item, object) {
    const sizeInfo = await getSizeInfo(item.name)
    item.links.size = `https://packagephobia.com/result?p=${item.name}`
    Object.assign(object, sizeInfo)
    Object.assign(item, sizeInfo)
    return Math.exp(-sizeInfo.installSize / 10000000)
  },
}

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000

let counter = 0
async function step<T>(title: string, callback: () => T | Promise<T>) {
  const startTime = Date.now()
  console.log(`┌ Step ${++counter}: ${title}`)
  const result = await callback()
  console.log(`└ Completed in ${Time.format(Date.now() - startTime)}`)
  return result
}

const log = (text: string) => console.log('│ ' + text)

async function catchError<T>(message: string, callback: () => T | Promise<T>) {
  try {
    return await callback()
  } catch (error) {
    return message
  }
}

const outdir = resolve(__dirname, '../dist')

class Synchronizer {
  private forceUpdate: boolean
  private latest: Dict<SearchObject>
  private legacy: Dict<SearchObject>
  private packages: AnalyzedPackage[]
  private scanner = new Scanner(async (url) => {
    const { data } = await axios.get(BASE_URL + url)
    return data
  })

  async start() {
    const shouldUpdate = await step('check update', () => this.check())
    if (!shouldUpdate) return
    console.log('::set-output name=update::true')

    await step('analyze packages', () => this.analyze())
    await step('bundle packages', () => this.bundleAll())
    await step('generate output', () => this.generate())
  }

  async check() {
    const [legacy] = await Promise.all([
      getLegacy(outdir),
      this.scanner.collect({ extra: sharedDeps }),
    ])

    this.latest = makeDict(this.scanner.objects)
    this.legacy = makeDict(legacy.objects)
    this.forceUpdate = version !== legacy.version
    if (this.forceUpdate) {
      log('force update due to version mismatch')
      return true
    }

    if (+new Date(this.scanner.time) - +new Date(legacy.time) > REFRESH_INTERVAL) {
      log('force update due to cache expiration')
      return true
    }

    let hasDiff = false
    for (const name in { ...this.latest, ...this.legacy }) {
      const date1 = this.legacy[name]?.package.date
      const date2 = this.latest[name]?.package.date
      if (date1 === date2) continue
      if (!date1) {
        log(kleur.green(`- ${name}: added`))
      } else if (!date2) {
        log(kleur.red(`- ${name}: removed`))
      } else {
        log(kleur.yellow(`- ${name}: updated`))
      }
      hasDiff = true
    }
    if (!hasDiff) {
      log('all packages are up-to-date')
    }
    return hasDiff
  }

  async analyze() {
    // check versions
    const verified = new Set<string>()
    this.packages = await this.scanner.analyze({
      version: '4',
      async onSuccess(item) {
        if (additional.includes(item.name)) item.verified = true
        if (item.verified) verified.add(item.shortname)
      },
      onFailure(name, reason) {
        console.error(`Failed to analyze ${name}: ${reason}`)
      },
    })

    // resolve name conflicts
    for (let index = this.packages.length - 1; index >= 0; index--) {
      const item = this.packages[index]
      if (item.verified || !verified.has(item.shortname)) continue
      this.packages.splice(index, 1)
      item.object.ignored = true
    }
  }

  shouldBundle(name: string) {
    if (this.forceUpdate) return true
    const legacy = this.legacy[name]?.package.date
    const latest = this.latest[name]?.package.date
    return legacy !== latest || this.legacy[name]?.portable === undefined
  }

  async bundle(name: string, outname: string, version: string, verified: boolean, message = '') {
    const meta = this.packages.find(item => item.name === outname)?.versions[version]
    if (!message && meta && !locateEntry(meta)) message = 'no entry'
    message = message
      || await catchError('prepare failed', () => prepare(name, version))
      || await catchError('bundle failed', () => bundle(name, outname, verified))
    if (message) {
      log(kleur.red(`${outname}@${version}: ${message}`))
    } else {
      log(kleur.green(`${outname}@${version}: success`))
    }
    return !message
  }

  async bundleAll() {
    await pMap(this.packages, async (item) => {
      const legacy = this.legacy[item.name]
      if (!this.shouldBundle(item.name)) {
        item.object.portable = item.portable = legacy.portable
        item.score = legacy.score
      } else {
        // bundle package
        let message = ''
        if (item.installSize > 5 * 1024 * 1024 && !item.verified) {
          message = 'size exceeded'
        }
        item.object.portable = item.portable = await this.bundle(item.name, item.name, item.version, item.verified, message)

        // evaluate score
        item.score.final = 0
        await Promise.all(Object.keys(weights).map(async (subject) => {
          let value = 0
          try {
            value = await evaluators[subject](item, item.object)
          } catch (e) {
            console.log('│ Failed to evaluate %s of %s', subject, item.object.package.name)
          }
          item.score.detail[subject] = value
          item.score.final += weights[subject] * value
        }))
      }

      // we don't need version details
      item.versions = pick(item.versions, [item.version])

      // pre-render markdown description
      item.manifest.description = valueMap(item.manifest.description, text => marked
        .parseInline(text)
        .replace('<a ', '<a target="_blank" rel="noopener noreferrer" '))
    }, { concurrency: 5 })

    for (const name of sharedDeps) {
      if (!this.shouldBundle(name)) {
        this.latest[name].portable = this.legacy[name].portable
      } else {
        const registry = await this.scanner.request<Registry>(`/${name}`)
        const version = maxSatisfying(Object.keys(registry.versions), '*')
        const message = await this.bundle(name === 'koishi' ? '@koishijs/core' : name, name, version, true)
        this.latest[name].portable = !message
      }
    }
  }

  async generate() {
    this.scanner.version = version
    await writeFile(resolve(outdir, 'index.json'), JSON.stringify(this.scanner))

    this.packages.sort((a, b) => b.score.final - a.score.final)
    const content = JSON.stringify({ timestamp: Date.now(), objects: this.packages })
    await writeFile(resolve(outdir, 'market.json'), content)

    // remove unused packages
    const folders = await readdir(outdir + '/modules')
    for (let index = folders.length - 1; index >= 0; index--) {
      const folder = folders[index]
      if (folder.startsWith('@')) {
        const subfolders = await readdir(outdir + '/modules/' + folder)
        folders.splice(index, 1, ...subfolders.map(name => folder + '/' + name))
      }
    }
    for (const folder of folders) {
      if (sharedDeps.includes(folder)) continue
      if (this.packages.find(item => item.name === folder && item.portable)) continue
      await rm(outdir + '/modules/' + folder, { recursive: true, force: true })
    }
  }
}

if (require.main === module) {
  new Synchronizer().start()
}

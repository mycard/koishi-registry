import Scanner, { AnalyzedPackage, DatedPackage, SearchObject, SearchResult } from '../src'
import { bundle, locateEntry, prepare, sharedDeps } from './bundle'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'
import { defineProperty, Dict, Time, valueMap } from 'cosmokit'
import { marked } from 'marked'
import { resolve } from 'path'
import kleur from 'kleur'
import axios from 'axios'
import pMap from 'p-map'

const version = 4

async function getLegacy(dirname: string) {
  await mkdir(dirname + '/modules', { recursive: true })
  try {
    return require(dirname) as SearchResult
  } catch {
    return { total: 0, objects: [], shared: [], time: '1970-01-01T00:00:00Z' }
  }
}

const BASE_URL = 'https://registry.npmjs.com'

function makeDict(result: SearchResult) {
  const dict: Dict<DatedPackage> = Object.create(null)
  for (const object of result.objects) {
    dict[object.package.name] = object.package
    defineProperty(object.package, 'object', object)
  }
  for (const object of result.shared || []) {
    dict[object.name] = object
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

const insecure = [
  'koishi-thirdeye',
]

const additional = [
  'koishi-plugin-assets-local',
  'koishi-plugin-assets-git',
  'koishi-plugin-assets-s3',
  'koishi-plugin-assets-smms',
  'koishi-plugin-assets-remote',
  'koishi-plugin-dialogue',
  'koishi-plugin-dice',
  'koishi-plugin-forward',
  'koishi-plugin-github',
  'koishi-plugin-migration',
  'koishi-plugin-gocqhttp',
  'koishi-plugin-puppeteer',
  'koishi-plugin-repeater',
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
    const latest = item.versions[item.version]
    if (insecure.some(name => latest.dependencies?.[name])) return 0
    return item.portable ? 0.75 : 0.5
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
  private latest: Dict<DatedPackage>
  private legacy: Dict<DatedPackage>
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
      this.scanner.collect({ shared: sharedDeps }),
    ])

    this.latest = makeDict(this.scanner)
    this.legacy = makeDict(legacy)
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
      const date1 = this.legacy[name]?.date
      const date2 = this.latest[name]?.date
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
      before(object) {
        if (additional.includes(object.package.name)) object.verified = true
      },
      async onSuccess(item) {
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

  hasUpdate(name: string) {
    if (this.forceUpdate) return true
    const legacy = this.legacy[name]?.date
    const latest = this.latest[name]?.date
    return legacy !== latest || this.legacy[name].portable === undefined
  }

  async bundle(name: string, version: string, verified: boolean, message = '') {
    const meta = this.packages.find(item => item.name === name)?.versions[version]
    if (!message && meta) {
      if (meta.koishi?.browser === false) {
        message = 'explicitly disabled'
      } else if (meta.koishi?.browser !== true && !locateEntry(meta)) {
        message = 'no browser entry'
      }
    }
    message = message
      || await catchError('prepare failed', () => prepare(name, version))
      || await catchError('bundle failed', () => bundle(name, verified))
    if (message) {
      log(kleur.red(`${name}@${version}: ${message}`))
    } else {
      log(kleur.green(`${name}@${version}: success`))
    }
    return !message
  }

  async bundleAll() {
    for (const name of sharedDeps) {
      const current = this.latest[name]
      if (!this.hasUpdate(name)) {
        current.portable = this.legacy[name].portable
      } else {
        const message = await this.bundle(name, current.version, true)
        current.portable = !message
      }
    }

    await pMap(this.packages, async (item) => {
      const legacy = this.legacy[item.name]
      if (!this.hasUpdate(item.name)) {
        item.object.package.portable = item.portable = legacy.portable
        for (const key of ['downloads', 'installSize', 'publishSize', 'score']) {
          item.object[key] = item[key] = legacy.object[key]
        }
      } else {
        // bundle package
        let message = ''
        if (item.installSize > 5 * 1024 * 1024 && !item.verified) {
          message = 'size exceeded'
        }
        item.object.package.portable = item.portable = await this.bundle(item.name, item.version, item.verified, message)

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
      delete item.versions

      // pre-render markdown description
      item.manifest.description = valueMap(item.manifest.description, text => marked
        .parseInline(text)
        .replace('<a ', '<a target="_blank" rel="noopener noreferrer" '))
    }, { concurrency: 5 })
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

import Scanner, { AnalyzedPackage, DatedPackage, SearchObject, SearchResult } from '../src'
import { bundle, check, locateEntry, prepare } from './bundle'
import { categories, ignored, shared, verified } from './utils'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'
import { defineProperty, Dict, Time } from 'cosmokit'
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

const REFRESH_INTERVAL = 12 * 60 * 60 * 1000
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

const weights: Record<Subjects, number> = {
  maintenance: 0.3,
  popularity: 0.4,
  quality: 0.3,
}

const evaluators: Record<Subjects, (item: AnalyzedPackage, object: SearchObject) => Promise<number>> = {
  async maintenance(item, object) {
    if (item.verified) return 1
    if (item.insecure || item.manifest.preview) return 0
    let score = 0.25
    if (item.portable) score += 0.25
    if (item.links.repository) score += 0.25
    return score
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
  private uncategorized: string[] = []
  private scanner = new Scanner(async (url) => {
    const { data } = await axios.get(BASE_URL + url)
    return data
  })

  async start() {
    const shouldUpdate = await step('check update', () => this.checkAll())
    if (!shouldUpdate) return
    console.log('::set-output name=update::true')

    await step('analyze packages', () => this.analyze())
    await step('bundle packages', () => this.bundleAll())
    await step('generate output', () => this.generate())
  }

  checkUpdate(name: string) {
    const date1 = this.legacy[name]?.date
    const date2 = this.latest[name]?.date
    if (date1 === date2) {
      return this.checkCategoryUpdate(name)
    } else if (!date1) {
      log(kleur.green(`- ${name}: added`))
    } else if (!date2) {
      log(kleur.red(`- ${name}: removed`))
    } else {
      log(kleur.yellow(`- ${name}: updated`))
    }
    return true
  }

  checkCategoryUpdate(name: string) {
    const official = /^@koishijs\/plugin-[0-9a-z-]+$/.test(name)
    const community = /(^|\/)koishi-plugin-[0-9a-z-]+$/.test(name)
    if (!official && !community) return
    const shortname = name.replace(/(koishi-|^@koishijs\/)plugin-/, '')
    if (this.legacy[name].category !== categories[shortname]) {
      log(kleur.blue(`- ${name}: categorized`))
      return true
    }
  }

  async checkAll() {
    const [legacy] = await Promise.all([
      getLegacy(outdir),
      this.scanner.collect({ shared, ignored }),
    ])

    this.latest = makeDict(this.scanner)
    this.legacy = makeDict(legacy)
    if (version !== legacy.version) {
      log('force update due to version mismatch')
      return this.forceUpdate = true
    }

    if (+new Date(this.scanner.time) - +new Date(legacy.time) > REFRESH_INTERVAL) {
      log('force update due to cache expiration')
      return this.forceUpdate = true
    }

    let hasDiff = false
    for (const name in { ...this.latest, ...this.legacy }) {
      hasDiff ||= this.checkUpdate(name)
    }
    if (!hasDiff) {
      log('all packages are up-to-date')
    }
    return hasDiff
  }

  async analyze() {
    // check versions
    const shortnames = new Set<string>()
    this.packages = await this.scanner.analyze({
      version: '4',
      before(object) {
        if (verified.includes(object.package.name)) object.verified = true
      },
      async onSuccess(item) {
        if (item.verified) shortnames.add(item.shortname)
      },
      onFailure(name, reason) {
        console.error(`Failed to analyze ${name}: ${reason}`)
      },
    })

    // resolve name conflicts
    for (let index = this.packages.length - 1; index >= 0; index--) {
      const item = this.packages[index]
      if (item.verified || !shortnames.has(item.shortname)) continue
      this.packages.splice(index, 1)
      item.object.ignored = true
    }
  }

  shouldBundle(name: string) {
    if (this.forceUpdate) return true
    if (this.legacy[name]?.date !== this.latest[name]?.date) return true
    if (this.legacy[name]?.portable === undefined) return true
    if (this.legacy[name]?.insecure === undefined) return true
  }

  async bundle(name: string, version: string, verified: boolean, message = '') {
    try {
      await prepare(name, version)
    } catch {
      log(kleur.red(`${name}@${version}: prepare failed`))
      return { portable: false, insecure: true }
    }

    try {
      await check(name, verified)
    } catch {
      log(kleur.red(`${name}@${version}: security check failed`))
      return { portable: false, insecure: true }
    }

    const meta = this.packages.find(item => item.name === name)?.versions[version]
    if (!message && meta) {
      if (meta.koishi?.browser === false) {
        message = 'explicitly disabled'
      } else if (meta.koishi?.browser !== true && !locateEntry(meta)) {
        message = 'no browser entry'
      }
    }
    message = message || await catchError('bundle failed', () => bundle(name, verified))
    if (message) {
      log(kleur.red(`${name}@${version}: ${message}`))
    } else {
      log(kleur.green(`${name}@${version}: success`))
    }
    return { portable: !message, insecure: false }
  }

  async bundleAll() {
    for (const name of shared) {
      const current = this.latest[name]
      if (!this.shouldBundle(name)) {
        current.portable = this.legacy[name].portable
      } else {
        const result = await this.bundle(name, current.version, true)
        current.portable = result.portable
      }
    }

    await pMap(this.packages, async (item) => {
      const legacy = this.legacy[item.name]
      if (!this.shouldBundle(item.name)) {
        item.portable = item.object.package.portable = legacy.portable
        item.insecure = item.object.package.insecure = legacy.insecure
        for (const key of ['downloads', 'installSize', 'publishSize', 'score']) {
          item.object[key] = item[key] = legacy.object[key]
        }
      } else {
        // bundle package
        let message = ''
        if (item.installSize > 5 * 1024 * 1024 && !item.verified) {
          message = 'size exceeded'
        }
        const result = await this.bundle(item.name, item.version, item.verified, message)
        item.portable = item.object.package.portable = result.portable
        item.insecure = item.object.package.insecure = result.insecure

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

      if (item.shortname in categories) {
        item.category = item.object.package.category = categories[item.shortname]
      } else {
        this.uncategorized.push(item.shortname)
      }

      // we don't need version details
      delete item.author
      delete item.versions
    }, { concurrency: 5 })
  }

  async generate() {
    this.scanner.version = version
    await writeFile(resolve(outdir, 'index.json'), JSON.stringify(this.scanner))

    this.packages.sort((a, b) => b.score.final - a.score.final)
    const content = JSON.stringify({ timestamp: Date.now(), objects: this.packages })
    await writeFile(resolve(outdir, 'market.json'), content)

    this.uncategorized.sort()
    await writeFile(resolve(outdir, 'uncategorized.txt'), this.uncategorized.join('\n'))

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
      if (shared.includes(folder)) continue
      if (this.packages.find(item => item.name === folder && item.portable)) continue
      await rm(outdir + '/modules/' + folder, { recursive: true, force: true })
    }
  }
}

if (require.main === module) {
  new Synchronizer().start()
}

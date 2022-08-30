import Scanner, { AnalyzedPackage, SearchObject, SearchResult } from '../src'
import { bundle, bundleAnalyzed } from './bundle'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'
import { Dict, Time, valueMap } from 'cosmokit'
import { marked } from 'marked'
import { resolve } from 'path'
import axios from 'axios'
import pMap from 'p-map'

const version = 4

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

const additional = [
  'koishi-plugin-dialogue',
  'koishi-plugin-dice',
  'koishi-plugin-github',
  'koishi-plugin-gocqhttp',
  'koishi-plugin-puppeteer',
  'koishi-plugin-screenshot',
]

const insecure = [
  'koishi-thirdeye',
]

const weights: Record<Subjects, number> = {
  maintenance: 0.2,
  popularity: 0.5,
  quality: 0.3,
}

const evaluators: Record<Subjects, (item: AnalyzedPackage, object: SearchObject) => Promise<number>> = {
  async maintenance(item, object) {
    if (item.verified) return 1
    if (insecure.some(name => item.versions[0].dependencies?.[name])) return 0
    return object.hasBundle ? 0.75 : 0.5
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

async function start() {
  const scanner = new Scanner(async (url) => {
    const { data } = await axios.get(BASE_URL + url)
    return data
  })

  const outdir = resolve(__dirname, '../dist')
  const [legacy] = await Promise.all([
    getLegacy(outdir),
    scanner.collect({
      extra: ['koishi'],
    }),
  ])

  const forceUpdate = version !== legacy.version
  const dictCurrent = makeDict(scanner.objects)
  const dictLegacy = makeDict(legacy.objects)
  const shouldUpdate = await step('check update', () => {
    if (+new Date(scanner.time) - +new Date(legacy.time) > REFRESH_INTERVAL) {
      console.log('│ update due to cache expiration')
      return true
    }

    if (forceUpdate) {
      console.log('│ update due to version mismatch')
      return true
    }

    let hasDiff = false
    for (const name in { ...dictCurrent, ...dictLegacy }) {
      const version1 = dictLegacy[name]?.package.version
      const version2 = dictCurrent[name]?.package.version
      if (version1 === version2) continue
      if (!version1) {
        console.log(`│ + ${name}: ${version2}`)
      } else if (!version2) {
        console.log(`│ - ${name}: ${version1}`)
      } else {
        console.log(`│ * ${name}: ${version1} -> ${version2}`)
      }
      hasDiff = true
    }
    if (!hasDiff) {
      console.log('│ all packages are up-to-date')
    }
    return hasDiff
  })

  if (!shouldUpdate) return
  console.log('::set-output name=update::true')

  const packages = await step('analyze packages', async () => {
    // check versions
    const verified = new Set<string>()
    const packages = await scanner.analyze({
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
    for (let index = packages.length - 1; index >= 0; index--) {
      const item = packages[index]
      if (item.verified || !verified.has(item.shortname)) continue
      packages.splice(index, 1)
      item.object.ignored = true
    }
    return packages
  })

  // bundle packages
  await step('bundle packages', () => pMap(packages, async (item) => {
    const old = dictLegacy[item.name]
    if (!forceUpdate && old?.hasBundle !== undefined && old?.package.version === item.version) {
      item.object.hasBundle = item.hasBundle = old.hasBundle
      item.score = old.score
    } else {
      // bundle package
      const message = await bundleAnalyzed(item)
      console.log(`│ ${item.name}@${item.version}: ${message || 'success'}`)
      item.object.hasBundle = item.hasBundle = !message

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
    item.versions = undefined

    // pre-render markdown description
    item.manifest.description = valueMap(item.manifest.description, text => marked
      .parseInline(text)
      .replace('<a ', '<a target="_blank" rel="noopener noreferrer" '))
  }, { concurrency: 5 }))

  await bundle('@koishijs/core', 'koishi')

  await step('write index', async () => {
    scanner.version = version
    await writeFile(resolve(outdir, 'index.json'), JSON.stringify(scanner))

    packages.sort((a, b) => b.score.final - a.score.final)
    const content = JSON.stringify({ timestamp: Date.now(), packages })
    await writeFile(resolve(outdir, 'market.json'), content)

    // remove unused packages
    const folders = await readdir(outdir + '/modules')
    for (let index = folders.length - 1; index > 0; index--) {
      const folder = folders[index]
      if (folder.startsWith('@')) {
        const subfolders = await readdir(outdir + '/modules/' + folder)
        console.log(subfolders)
        folders.splice(index, 1, ...subfolders.map(name => folder + '/' + name))
      }
    }
    for (const folder of folders) {
      if (folder === 'koishi' || packages.find(item => item.name === folder)) continue
      await rm(outdir + '/modules/' + folder, { recursive: true, force: true })
    }
  })
}

if (require.main === module) {
  start()
}

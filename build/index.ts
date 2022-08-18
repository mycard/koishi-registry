import Scanner, { AnalyzedPackage, SearchObject, SearchResult } from '../src'
import { mkdir, writeFile } from 'fs/promises'
import { Dict, valueMap } from 'cosmokit'
import { marked } from 'marked'
import { resolve } from 'path'
import bundle from './bundle'
import axios from 'axios'
import pMap from 'p-map'

export function deepEqual(a: any, b: any) {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false
  if (!a || !b) return false

  // check array
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  } else if (Array.isArray(b)) {
    return false
  }

  // check object
  return Object.keys({ ...a, ...b }).every(key => deepEqual(a[key], b[key]))
}

async function getLegacy(dirname: string) {
  await mkdir(dirname, { recursive: true })
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

const verified = [
  'koishi-plugin-dialogue',
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

const evaluators: Record<Subjects, (object: SearchObject) => Promise<number>> = {
  async maintenance(object) {
    const { name } = object.package
    const official = name.startsWith('@koishijs/plugin-') || verified.includes(name)
    return official ? 2 : 1
  },
  async popularity(object) {
    const downloads = await getDownloads(object.package.name)
    object.downloads = downloads
    return softmax(downloads.lastMonth / 200)
  },
  async quality(object: SearchObject) {
    const sizeInfo = await getSizeInfo(object.package.name)
    object.package.links.size = `https://packagephobia.com/result?p=${object.package.name}`
    Object.assign(object, sizeInfo)
    return Math.exp(-sizeInfo.installSize / 10000000)
  },
}

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000

async function start() {
  const scanner = new Scanner(async (url) => {
    const { data } = await axios.get(BASE_URL + url)
    return data
  })

  const dirname = resolve(__dirname, '../dist')
  const [legacy] = await Promise.all([getLegacy(dirname), scanner.collect()])

  function shouldUpdate() {
    if (+new Date(scanner.time) - +new Date(legacy.time) > REFRESH_INTERVAL) return true
    if (scanner.total !== legacy.total) return true
    const dict1 = makeDict(scanner.objects)
    const dict2 = makeDict(legacy.objects)
    for (const name in { ...dict1, ...dict2 }) {
      if (!deepEqual(dict1[name]?.package, dict2[name]?.package)) return true
    }
  }

  const isScheduled = process.env.GITHUB_EVENT_NAME === 'schedule'
  if (isScheduled && !shouldUpdate()) return
  console.log('::set-output name=update::true')

  // check versions
  const packages = await scanner.analyze({
    version: '4',
    async onSuccess(item, object) {
      // we don't need version details
      item.versions = undefined

      // pre-render markdown description
      item.manifest.description = valueMap(item.manifest.description, (text) => {
        return marked
          .parseInline(text)
          .replace('<a ', '<a target="_blank" rel="noopener noreferrer" ')
      })
    },
    onFailure(name, reason) {
      console.error(`Failed to analyze ${name}: ${reason}`)
    },
  })

  // evaluate score
  scanner.objects = scanner.objects.filter(object => !object.ignore)
  await pMap(scanner.objects, async (object) => {
    object.score.final = 0
    await Promise.all(Object.keys(weights).map(async (subject) => {
      let value = 0
      try {
        value = await evaluators[subject](object)
      } catch (e) {
        console.log('Failed to evaluate %s of %s', subject, object.package.name)
      }
      object.score.detail[subject] = value
      object.score.final += weights[subject] * value
    }))
  }, { concurrency: 10 })

  // write to file
  await writeFile(resolve(dirname, 'index.json'), JSON.stringify(scanner))

  packages.sort((a, b) => b.score.final - a.score.final)
  const content = JSON.stringify({ timestamp: Date.now(), packages })
  await writeFile(resolve(dirname, 'market.json'), content)

  // bundle plugins
  function execute({ name, version, official, installSize }: AnalyzedPackage) {
    if (installSize > 5 * 1024 * 1024 && !official) return 'size exceeded'
    return bundle(name, version).catch(() => 'prepare failed')
  }

  await Promise.all(packages.map(async (item) => {
    const message = await execute(item)
    console.log(`- ${item.name}@${item.version}: ${message || 'success'}`)
  }))
}

if (require.main === module) {
  start()
}

import { AnalyzedPackage, Scanner, SearchObject, SearchResult } from '../src'
import { mkdir, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { marked } from 'marked'
import axios from 'axios'

const BASE_URL = 'https://registry.npmjs.com'

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

async function start() {
  const scanner = new Scanner({
    async request(url) {
      const { data } = await axios.get(BASE_URL + url)
      return data
    },
  })

  const objects = await scanner.collect()
  const total = Object.keys(objects).length
  const dirname = resolve(__dirname, '../dist')
  const legacy = await getLegacy(dirname)

  function hasDiff() {
    if (total !== legacy.total) return true
    const dict: Record<string, SearchObject> = {}
    for (const object of legacy.objects) {
      dict[object.package.name] = object
    }
    for (const name in { ...objects, ...dict }) {
      if (!deepEqual(objects[name]?.package, dict[name]?.package)) return true
    }
  }

  if (!hasDiff()) return
  const time = new Date().toUTCString()
  const result: SearchResult = { total, objects: Object.values(objects), time }
  await writeFile(resolve(dirname, 'index.json'), JSON.stringify(result))

  const packages: AnalyzedPackage[] = []
  await scanner.analyze({
    version: '4',
    onSuccess(item) {
      // @ts-ignore
      delete item.versions
      item.description = marked
        .parseInline(item.description || '')
        .replace('<a ', '<a target="_blank" rel="noopener noreferrer" ')
      packages.push(item)
    },
    onFailure(name, reason) {
      console.error(`Failed to analyze ${name}: ${reason}`)
    },
  })
  packages.sort((a, b) => b.popularity - a.popularity)
  const content = JSON.stringify({ timestamp: Date.now(), packages })
  writeFile(dirname + '/market.json', content)
}

if (require.main === module) {
  start()
}

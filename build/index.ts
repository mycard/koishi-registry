import Scanner, { SearchObject, SearchResult } from '../src'
import { mkdir, writeFile } from 'fs/promises'
import { Dict } from 'cosmokit'
import { marked } from 'marked'
import { resolve } from 'path'
import axios from 'axios'

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

async function start() {
  const scanner = new Scanner(async (url) => {
    const { data } = await axios.get(BASE_URL + url)
    return data
  })

  const dirname = resolve(__dirname, '../dist')
  const [legacy] = await Promise.all([getLegacy(dirname), scanner.collect()])

  function hasDiff() {
    if (scanner.total !== legacy.total) return true
    const dict1 = makeDict(scanner.objects)
    const dict2 = makeDict(legacy.objects)
    for (const name in { ...dict1, ...dict2 }) {
      if (!deepEqual(dict1[name]?.package, dict2[name]?.package)) return true
    }
  }

  if (!hasDiff()) return
  await writeFile(resolve(dirname, 'index.json'), JSON.stringify(scanner))

  const packages = await scanner.analyze({
    version: '4',
    async onSuccess(item) {
      const { data } = await axios.get('https://api.nuxtjs.org/api/npm/package/' + item.name)
      const t = Math.exp(-data.downloads.lastMonth)
      item.versions = undefined
      item.popularity = (1 - t) / (1 + t)
      item.description = marked
        .parseInline(item.description || '')
        .replace('<a ', '<a target="_blank" rel="noopener noreferrer" ')
    },
    onFailure(name, reason) {
      console.error(`Failed to analyze ${name}: ${reason}`)
    },
  })
  packages.sort((a, b) => b.popularity - a.popularity)
  const content = JSON.stringify({ timestamp: Date.now(), packages })
  await writeFile(dirname + '/market.json', content)
}

if (require.main === module) {
  start()
}

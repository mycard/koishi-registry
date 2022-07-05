import { SearchObject, SearchResult } from '../src'
import { mkdir, writeFile } from 'fs/promises'
import { resolve } from 'path'
import axios from 'axios'

const objects: Record<string, SearchObject> = {}

async function search(offset: number) {
  const { data: result } = await axios.get<SearchResult>(`https://registry.npmjs.com/-/v1/search?text=koishi+plugin&size=250&offset=${offset}`)
  for (const object of result.objects) {
    objects[object.package.name] = object
  }
  return result.total
}

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

async function start() {
  const total = await search(0)
  for (let offset = 250; offset < total; offset += 250) {
    await search(offset)
  }

  const dirname = resolve(__dirname, '../dist')
  await mkdir(dirname, { recursive: true })
  const legacy: SearchResult = require(dirname)

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

  if (hasDiff()) {
    const time = new Date().toUTCString()
    const result: SearchResult = { total, objects: Object.values(objects), time }
    await writeFile(resolve(dirname, 'index.json'), JSON.stringify(result))
  }
}

if (require.main === module) {
  start()
}

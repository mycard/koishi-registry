import { SearchObject, SearchResult } from '../src'
import { writeFile } from 'fs/promises'
import { resolve } from 'path'
import axios from 'axios'

const objects: SearchObject[] = []

async function search(offset: number) {
  const { data: result } = await axios.get<SearchResult>(`https://registry.npmjs.com/-/v1/search?text=koishi+plugin&size=250&offset=${offset}`)
  objects.push(...result.objects)
  return result.total
}

async function start() {
  const total = await search(0)
  for (let offset = 250; offset < total; offset += 250) {
    await search(offset)
  }
  const result: SearchResult = { total, objects, time: '' }
  writeFile(resolve(__dirname, '../dist', 'result.json'), JSON.stringify(result))
}

if (require.main === module) {
  start()
}

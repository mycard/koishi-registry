import { SearchObject, SearchResult } from '../src'
import { mkdir, writeFile } from 'fs/promises'
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
  const dirname = resolve(__dirname, '../dist')
  const result: SearchResult = { total, objects, time: '' }
  await mkdir(dirname, { recursive: true })
  writeFile(resolve(dirname, 'result.json'), JSON.stringify(result, null, 2))
}

if (require.main === module) {
  start()
}

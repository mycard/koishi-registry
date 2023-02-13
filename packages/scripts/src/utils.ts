import { Dict } from 'cosmokit'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'

function loadData(path: string) {
  const content = readFileSync(resolve(__dirname, '../data', path), 'utf8')
  return content.split(/\r?\n/).filter(Boolean)
}

export const ignored = loadData('ignored.txt')
export const insecure = loadData('insecure.txt')
export const verified = loadData('verified.txt')

export const categories: Dict<string> = {}

for (const key of readdirSync(resolve(__dirname, '../data/categories'))) {
  if (!key.endsWith('.txt')) continue
  for (const name of loadData('categories/' + key)) {
    categories[name] = key.slice(0, -4)
  }
}

import { mkdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'

const outdir = resolve(__dirname, '../play')
const endpoint = 'https://koishi.js.org/registry/modules'
const relpath = '/@koishijs/plugin-console/dist'
const filename = resolve(__dirname, `../dist/modules${relpath}/index.html`)

async function start() {
  let template = await readFile(filename, 'utf8')
  template = template.replace(/(href|src)="(?=\/)/g, (_, $1) => `${$1}="${endpoint + relpath}`)
  const headInjection = `<script>KOISHI_CONFIG = ${JSON.stringify({
    client: true,
    uiPath: '/',
    endpoint,
  })}</script>`
  template = template.replace('</title>', '</title>' + headInjection)
  await mkdir(outdir, { recursive: true })
  await writeFile(resolve(outdir, 'index.html'), template)
}

if (require.main === module) {
  start()
}

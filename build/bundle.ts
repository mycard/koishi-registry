import { mkdir, rm, writeFile } from 'fs/promises'
import { SpawnOptions } from 'child_process'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'
import { createRequire } from 'module'
import spawn from 'cross-spawn'
import { PackageJson } from '../src'

function spawnAsync(args: string[], options?: SpawnOptions) {
  const child = spawn(args[0], args.slice(1), { ...options, stdio: 'ignore' })
  return new Promise<number>((resolve, reject) => {
    child.on('close', resolve)
  })
}

const tempDir = resolve(__dirname, '../temp')
const tempRequire = createRequire(tempDir + '/package.json')

export default async function start(name: string, version: string) {
  await rm(tempDir, { recursive: true, force: true })
  await mkdir(tempDir, { recursive: true })
  await writeFile(tempDir + '/index.js', `module.exports = require('${name}')`)
  await writeFile(tempDir + '/package.json', JSON.stringify({
    dependencies: {
      [name]: version,
    },
  }))

  const code = await spawnAsync(['npm', 'install'], { cwd: tempDir })
  if (code) return 'install failed'

  return bundle(name).catch(() => 'bundle failed')
}

async function bundle(name: string) {
  const meta: PackageJson = tempRequire(name + '/package.json')
  const result = await build({
    outdir: resolve(__dirname, '../dist'),
    outbase: tempDir,
    entryPoints: [tempDir + '/index.js'],
    bundle: true,
    minify: true,
    write: false,
    charset: 'utf8',
    platform: 'browser',
    target: 'esnext',
    format: 'cjs',
    logLevel: 'silent',
    define: {
      'process.env.KOISHI_PLAY': 'true',
    },
    plugins: [{
      name: 'dep check',
      setup(build) {
        build.onResolve({ filter: /^[@/\w-]+$/ }, (args) => {
          if (args.path in meta.peerDependencies) return { external: true }
          return null
        })
      },
    }],
  })

  const { contents } = result.outputFiles[0]
  if (contents.byteLength > 1024 * 1024) return 'size exceeded'
  const filename = resolve(__dirname, '../dist/plugins', name + '.js')
  await mkdir(dirname(filename), { recursive: true })
  await writeFile(filename, contents)
}

if (tempRequire.main === module) {
  start('koishi-plugin-hangman', '1.0.11')
}

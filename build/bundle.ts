import { mkdir, rm, writeFile } from 'fs/promises'
import { SpawnOptions } from 'child_process'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'
import spawn from 'cross-spawn'

function spawnAsync(args: string[], options?: SpawnOptions) {
  const child = spawn(args[0], args.slice(1), { ...options, stdio: 'inherit' })
  return new Promise<number>((resolve) => {
    child.on('close', resolve)
  })
}

export default async function bundle(name: string, version: string) {
  const tempDir = resolve(__dirname, '../temp')
  await rm(tempDir, { recursive: true, force: true })
  await mkdir(tempDir, { recursive: true })
  await writeFile(tempDir + '/index.js', `module.exports = require('${name}')`)
  await writeFile(tempDir + '/package.json', JSON.stringify({
    dependencies: {
      [name]: version,
    },
  }))
  await spawnAsync(['yarn'], { cwd: tempDir })

  await build({
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
    define: {
      'process.env.KOISHI_PLAY': 'true',
    },
    plugins: [{
      name: 'dep check',
      setup(build) {
        build.onResolve({ filter: /^[@/\w-]+$/ }, (args) => {
          if (args.path === 'koishi') return { external: true }
          return null
        })
      },
    }],
  }).then(async ({ outputFiles }) => {
    const filename = resolve(__dirname, '../dist/plugins', name + '.js')
    await mkdir(dirname(filename), { recursive: true })
    await writeFile(filename, outputFiles[0].contents)
  }).catch(() => {})
}

if (require.main === module) {
  bundle('koishi-plugin-hangman', '1.0.4')
}

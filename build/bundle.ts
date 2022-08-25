import { AnalyzedPackage, PackageJson } from '../src'
import { mkdir, rm, writeFile } from 'fs/promises'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'
import { createRequire } from 'module'
import parse from 'yargs-parser'
import spawn from 'execa'

function spawnAsync(args: string[], options?: spawn.Options) {
  const child = spawn(args[0], args.slice(1), { stdio: 'ignore', ...options })
  return new Promise<number>((resolve, reject) => {
    child.on('close', resolve)
  })
}

const tempDir = resolve(__dirname, '../temp')

async function prepare(cwd: string, name: string, version: string) {
  await rm(cwd, { recursive: true, force: true })
  await mkdir(cwd, { recursive: true })
  await writeFile(cwd + '/index.js', `module.exports = require('${name}')`)
  await writeFile(cwd + '/package.json', JSON.stringify({
    dependencies: {
      [name]: version,
    },
    browser: {
      path: false,
    },
  }))

  const code = await spawnAsync(['npm', 'install', '--legacy-peer-deps'], { cwd })
  if (code) throw new Error('npm install failed')
}

export async function bundleAnalyzed({ name, version, installSize, verified }: AnalyzedPackage) {
  if (installSize > 5 * 1024 * 1024 && !verified) return 'size exceeded'

  const cwd = resolve(tempDir, name)
  try {
    await prepare(cwd, name, version)
  } catch (err) {
    return 'prepare failed'
  }

  return bundle(name, cwd).catch(() => 'bundle failed')
}

async function start(name: string, version = 'latest') {
  await prepare(tempDir, name, version)
  await bundle(name, tempDir)
}

async function bundle(name: string, cwd: string) {
  const outdir = resolve(__dirname, '../dist/modules', name)
  const require = createRequire(cwd + '/package.json')
  const meta: PackageJson = require(name + '/package.json')
  const result = await build({
    entryPoints: [cwd + '/index.js'],
    bundle: true,
    minify: true,
    write: false,
    charset: 'utf8',
    platform: 'browser',
    target: 'esnext',
    format: 'esm',
    logLevel: 'silent',
    define: {
      'process.env.KOISHI_ENV': JSON.stringify('browser'),
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
  const filename = resolve(outdir, 'lib/index.js')
  await mkdir(dirname(filename), { recursive: true })
  await writeFile(filename, contents)
}

if (require.main === module) {
  const argv = parse(process.argv.slice(2))
  if (!argv._.length) throw new Error('package name required')
  start('' + argv._[0])
}

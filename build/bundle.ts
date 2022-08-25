import { AnalyzedPackage, PackageJson } from '../src'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'
import { createRequire } from 'module'
import parse from 'yargs-parser'
import globby from 'globby'
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
      'process.env.KOISHI_BASE': JSON.stringify('https://koishi.js.org/registry/x/' + name),
    },
    plugins: [{
      name: 'dep check',
      setup(build) {
        build.onResolve({ filter: /^[@/\w-]+$/ }, (args) => {
          if (!meta.peerDependencies[args.path]) return null
          return { external: true, path: 'https://koishi.js.org/registry/x/' + args.path + '/index.js' }
        })
      },
    }],
  })

  const basedir = dirname(require.resolve(cwd))
  const outdir = resolve(__dirname, '../dist/x', name)
  const { contents } = result.outputFiles[0]
  let length = contents.byteLength
  if (length > 1024 * 1024) return 'size exceeded'
  const filename = resolve(outdir, 'index.js')
  await mkdir(dirname(filename), { recursive: true })
  await writeFile(filename, contents)

  const files = await globby(meta.koishi?.public || [], { cwd: basedir })
  for (const file of files) {
    const buffer = await readFile(resolve(basedir, file))
    length += buffer.byteLength
    if (length > 1024 * 1024) return 'size exceeded'
    await writeFile(resolve(basedir, file), buffer)
  }
}

if (require.main === module) {
  const argv = parse(process.argv.slice(2))
  if (!argv._.length) throw new Error('package name required')
  start('' + argv._[0])
}

import { AnalyzedPackage, PackageJson } from '../src'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { exec, ExecOptions } from 'child_process'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'
import { createRequire } from 'module'
import parse from 'yargs-parser'
import globby from 'globby'

function spawnAsync(args: string[], options?: ExecOptions) {
  const child = exec(args.join(' '), options)
  return new Promise<number>((resolve, reject) => {
    child.on('close', resolve)
  })
}

const tempDir = resolve(__dirname, '../temp')

async function prepareBundle(cwd: string, name: string, version: string) {
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
    await prepareBundle(cwd, name, version)
  } catch (err) {
    return 'prepare failed'
  }

  return createBundle(name, name, cwd).catch(() => 'bundle failed')
}

async function bundle(name: string, outname = name, version = 'latest') {
  const cwd = resolve(tempDir, name)
  await prepareBundle(cwd, name, version)
  await createBundle(name, outname, cwd)
}

async function createBundle(name: string, outname: string, cwd: string) {
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
      'process.env.KOISHI_BASE': JSON.stringify('https://koishi.js.org/registry/modules/' + name),
    },
    plugins: [{
      name: 'dep check',
      setup(build) {
        build.onResolve({ filter: /^[@/\w-]+$/ }, (args) => {
          if (!meta.peerDependencies?.[args.path]) return null
          return { external: true, path: 'https://koishi.js.org/registry/modules/' + args.path + '/index.js' }
        })
      },
    }],
  })

  const basedir = dirname(require.resolve(cwd))
  const outdir = resolve(__dirname, '../dist/modules', outname)
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
    if (length > 1024 * 1024) {
      await rm(outdir, { recursive: true, force: true })
      return 'size exceeded'
    }
    await writeFile(resolve(basedir, file), buffer)
  }
}

if (require.main === module) {
  const argv = parse(process.argv.slice(2))
  if (!argv._.length) throw new Error('package name required')
  bundle('' + argv._[0])
}

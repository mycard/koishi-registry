import { PackageJson } from '../src'
import { mkdir, readdir, readFile, rm, writeFile } from 'fs/promises'
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

export async function prepare(name: string, version: string) {
  const cwd = resolve(tempDir, name)
  await rm(cwd, { recursive: true, force: true })
  await mkdir(cwd, { recursive: true })
  await writeFile(cwd + '/index.js', '')
  await writeFile(cwd + '/package.json', JSON.stringify({
    dependencies: {
      [name]: version,
    },
  }))

  const code = await spawnAsync(['npm', 'install', '--legacy-peer-deps', '--registry', 'https://'], { cwd })
  if (code) throw new Error('npm install failed')
}

function locateEntry(meta: PackageJson) {
  if (typeof meta.exports === 'string') {
    return meta.exports
  } else if (meta.exports) {
    const entry = meta.exports['.']
    if (typeof entry === 'string') {
      return entry
    } else {
      const result = entry.browser || entry.import || entry.default
      if (typeof result === 'string') return result
    }
  }
}

export async function bundle(name: string, outname: string) {
  const cwd = resolve(tempDir, name)
  const require = createRequire(cwd + '/package.json')
  const meta: PackageJson = require(name + '/package.json')
  const entry = locateEntry(meta)
  if (!entry) return 'no entry'
  console.log(outname)
  const basedir = dirname(require.resolve(name + '/package.json'))
  const result = await build({
    entryPoints: [resolve(basedir, entry)],
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

  const outdir = resolve(__dirname, '../dist/modules', outname)
  const { contents } = result.outputFiles[0]
  let length = contents.byteLength
  if (length > 1024 * 1024) return 'size exceeded'
  const filename = resolve(outdir, 'index.js')
  await rm(outdir, { recursive: true, force: true })
  await mkdir(outdir, { recursive: true })
  await writeFile(filename, contents)

  const files = await globby(meta.koishi?.public || [], { cwd: basedir })
  for (const file of files) {
    const buffer = await readFile(resolve(basedir, file))
    length += buffer.byteLength
    if (length > 1024 * 1024) {
      await rm(outdir, { recursive: true, force: true })
      return 'size exceeded'
    }
    const filename = resolve(outdir, file)
    await mkdir(dirname(filename), { recursive: true })
    await writeFile(filename, buffer)
  }
  console.log(await readdir(resolve(__dirname, '../dist/modules')))
}

if (require.main === module) {
  const argv = parse(process.argv.slice(2))
  if (!argv._.length) throw new Error('package name required')
  const name = '' + argv._[0]
  Promise.resolve().then(async () => {
    await prepare(name, 'latest')
    await bundle(name, name)
  })
}

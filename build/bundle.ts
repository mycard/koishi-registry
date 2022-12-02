import { PackageJson } from '../src'
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

const endpoint = 'https://registry.koishi.chat'
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
    browser: {
      path: false,
      fs: false,
    },
  }))

  const code = await spawnAsync(['npm', 'install', '--legacy-peer-deps'], { cwd })
  if (code) throw new Error('npm install failed')
}

export function locateEntry(meta: Partial<PackageJson>) {
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
  return meta.module
}

export const sharedDeps = [
  'koishi',
  '@koishijs/helpers',
  '@koishijs/loader',
]

const redirects = [
  'vue.js',
  'vue-router.js',
  'vueuse.js',
  'client.js',
  'element.js',
]

export async function bundle(name: string, verified = false) {
  const cwd = resolve(tempDir, name)
  const require = createRequire(cwd + '/package.json')
  const meta: PackageJson = require(name + '/package.json')
  const entry = locateEntry(meta) || meta.main
  const basedir = dirname(require.resolve(name + '/package.json'))
  const external = new Set([...sharedDeps, ...Object.keys(meta.peerDependencies || {})])
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
      'process.env.KOISHI_REGISTRY': JSON.stringify(endpoint),
      'process.env.KOISHI_BASE': JSON.stringify(endpoint + '/modules/' + name),
    },
    plugins: [{
      name: 'external',
      setup(build) {
        const escape = (text: string) => `^${text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`
        const filter = new RegExp([...external].map(escape).join('|'))
        build.onResolve({ filter: /.*/, namespace: 'external' }, (args) => ({
          external: true,
          path: endpoint + '/modules/' + args.path + '/index.js',
        }))
        build.onResolve({ filter }, (args) => ({
          path: args.path,
          namespace: 'external',
        }))
        build.onLoad({ filter: /.*/, namespace: 'external' }, (args) => ({
          contents: `export * from ${JSON.stringify(args.path)}`,
        }))
      },
    }],
  })

  const outdir = resolve(__dirname, '../dist/modules', name)
  const { contents } = result.outputFiles[0]
  let length = contents.byteLength
  if (!verified && length > 1024 * 1024) return 'size exceeded'
  const filename = resolve(outdir, 'index.js')
  await rm(outdir, { recursive: true, force: true })
  await mkdir(outdir, { recursive: true })
  await writeFile(filename, contents)

  const files = await globby(meta.koishi?.public || [], { cwd: basedir })
  for (const file of files) {
    const buffer = await readFile(resolve(basedir, file))
    length += buffer.byteLength
    if (!verified && length > 1024 * 1024) {
      await rm(outdir, { recursive: true, force: true })
      return 'size exceeded'
    }
    const filename = resolve(outdir, file)
    await mkdir(dirname(filename), { recursive: true })
    await writeFile(filename, buffer)
  }

  if (meta.peerDependencies?.['@koishijs/plugin-console']) {
    for (const name of redirects) {
      const filename = resolve(outdir, name)
      await writeFile(filename, `export * from "${endpoint}/modules/@koishijs/plugin-console/dist/${name}";\n`)
    }
  }

  if (name === '@koishijs/plugin-console') {
    console.log('::set-output name=playground::true')
  }
}

if (require.main === module) {
  const argv = parse(process.argv.slice(2))
  if (!argv._.length) throw new Error('package name required')
  const name = '' + argv._[0]
  Promise.resolve().then(async () => {
    await prepare(name, 'latest')
    const filename = resolve(__dirname, '../dist/modules', name, 'index.js')
    console.log(await bundle(name, true) || filename)
  })
}

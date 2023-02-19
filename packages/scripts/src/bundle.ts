import { PackageJson } from '@koishijs/registry'
import { mkdir, readdir, readFile, rm, writeFile } from 'fs/promises'
import { exec, ExecOptions } from 'child_process'
import { dirname, resolve } from 'path'
import { build } from 'esbuild'
import { createRequire } from 'module'
import { insecure } from './utils'
import { commonjs, fields, globals, injects, vendors } from '@koishijs/shared-packages'
import parse from 'yargs-parser'
import globby from 'globby'

function spawnAsync(args: string[], options?: ExecOptions) {
  const child = exec(args.join(' '), options)
  return new Promise<number>((resolve, reject) => {
    child.on('close', resolve)
  })
}

const endpoint = 'https://registry.koishi.chat'
const tempDir = resolve(__dirname, '../../../temp')

export async function prepare(name: string, version: string) {
  const cwd = resolve(tempDir, name)
  await rm(cwd, { recursive: true, force: true })
  await mkdir(cwd, { recursive: true })
  await writeFile(cwd + '/index.js', fields[name] ? [
    `import mod from '${name}';`,
    ...fields[name].map((field) => `export const ${field} = mod.${field};`),
  ].join('\n') : '')
  await writeFile(cwd + '/package.json', JSON.stringify({
    dependencies: {
      [name]: version,
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
  if (typeof meta.browser === 'string') return meta.browser
  return meta.module
}

const redirects = [
  'vue.js',
  'vue-router.js',
  'vueuse.js',
  'client.js',
  'element.js',
]

export async function check(name: string, verified = false) {
  await traverse(resolve(tempDir, name))
}

async function traverse(cwd: string) {
  const dirents = await readdir(cwd, { withFileTypes: true })
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      await traverse(resolve(cwd, dirent.name))
    } else if (dirent.name.endsWith('.node')) {
      throw new Error('native modules not allowed')
    } else if (dirent.name === 'package.json') {
      const meta: PackageJson = JSON.parse(await readFile(resolve(cwd, dirent.name), 'utf8'))
      if (insecure.includes(meta.name)) {
        throw new Error('insecure modules not allowed')
      }
    }
  }
}

function resolveVendor(name: string) {
  return endpoint + '/modules/' + (vendors[name] ?? name) + '/index.js'
}

export async function bundle(name: string, verified = false) {
  const cwd = resolve(tempDir, name)
  const require = createRequire(cwd + '/package.json')
  const meta: PackageJson = require(name + '/package.json')
  const entry = fields[name]
    ? resolve(cwd, 'index.js')
    : locateEntry(meta) || meta.main || 'index.js'
  const basedir = dirname(require.resolve(name + '/package.json'))
  const external = new Set([...Object.keys(vendors), ...Object.keys(meta.peerDependencies || {})])
  const result = await build({
    entryPoints: [resolve(basedir, entry)],
    bundle: true,
    minify: require.main !== module,
    drop: ['console', 'debugger'],
    write: false,
    charset: 'utf8',
    platform: 'browser',
    target: 'esnext',
    format: 'esm',
    logLevel: 'silent',
    define: {
      'global': 'globalThis',
      'process.env.KOISHI_ENV': JSON.stringify('browser'),
      'process.env.KOISHI_REGISTRY': JSON.stringify(endpoint),
      'process.env.KOISHI_BASE': JSON.stringify(endpoint + '/modules/' + name),
    },
    inject: globals.includes(name) ? [] : injects,
    plugins: [{
      name: 'external',
      setup(build) {
        const escape = (text: string) => `^${text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`
        const filter = new RegExp([...external].map(escape).join('|'))
        build.onResolve({ filter }, (args) => args.path === name ? null : args.kind === 'require-call' ? ({
          path: args.path,
          namespace: 'external',
        }) : ({
          external: true,
          path: resolveVendor(args.path),
        }))
        build.onResolve({ filter: /.*/, namespace: 'external' }, (args) => ({
          external: true,
          path: resolveVendor(args.path),
        }))
        build.onLoad({ filter: /.*/, namespace: 'external' }, (args) => ({
          contents: commonjs.includes(args.path)
            ? `import mod from ${JSON.stringify(args.path)}; export default mod;`
            : `export * from ${JSON.stringify(args.path)};`,
        }))
      },
    }],
  })

  const outdir = resolve(__dirname, '../../../dist/modules', name)
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
      await writeFile(filename, `export * from "https://play.koishi.chat/${name}";\n`)
    }
  }
}

if (require.main === module) {
  const argv = parse(process.argv.slice(2))
  if (!argv._.length) throw new Error('package name required')
  const name = '' + argv._[0]
  Promise.resolve().then(async () => {
    await prepare(name, 'latest')
    const filename = resolve(__dirname, '../../../dist/modules', name, 'index.js')
    console.log(await bundle(name, true) || filename)
  })
}

const { join } = require('path')

const dependencies = {}
const vendors = {}

for (const [name, request] of Object.entries(require('./package.json').dependencies)) {
  if (request.startsWith('npm:')) {
    const [target] = request.slice(4).split(/(?<=.+)@/, 1)
    dependencies[target] = request.slice(4 + target.length + 1)
    vendors[name] = target
  } else {
    dependencies[name] = request
    vendors[name] = name
  }
}

const globals = ['buffer', 'process']
const commonjs = [
  'assert',
  'constants',
  'crypto',
  'events',
  'filer',
  'path',
  'process',
  'stream',
  'util',
  'zlib',
]
const fields = {
  buffer: ['Buffer', 'SlowBuffer', 'INSPECT_MAX_BYTES', 'kMaxLength'],
}

module.exports = {
  dependencies,
  vendors,
  globals,
  commonjs,
  fields,
  injects: [join(__dirname, 'globals.js')],
}

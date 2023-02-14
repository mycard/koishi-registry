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
  'buffer',
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

module.exports = {
  dependencies,
  vendors,
  globals,
  commonjs,
  injects: [join(__dirname, 'globals.js')],
}

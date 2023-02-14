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

module.exports = {
  dependencies,
  vendors,
}

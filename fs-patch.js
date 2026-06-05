// Patch for Node 22 compatibility with @nodelib/fs
const fs = require('fs')
const fsOriginal = { ...fs }
if (!fs.createFileSystemAdapter) {
  fs.createFileSystemAdapter = (fsMethods) => {
    const adapter = { ...fsOriginal, ...fsMethods }
    return Object.fromEntries(
      Object.entries(adapter).filter(([k]) => typeof adapter[k] === 'function')
    )
  }
}
module.exports = fs

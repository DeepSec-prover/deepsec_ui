import path from 'path'

const mixin = {
  methods : {
    fileName (filePath) {
      return path.basename(filePath).replace(/\.dps$/ui, '')
    }
  }
}

export default mixin

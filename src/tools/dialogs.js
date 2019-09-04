const { dialog } = require('electron')

/**
 * Open the file selector and do an action with the file path.
 * TODO replace callback with promise
 *
 * @param callback - The action to do with the file path
 */
function openResultFile (callback) {
  const promise = dialog.showOpenDialog(null, {
    properties: ['openFile'],
    filters: [
      {
        name: 'JSON', extensions: ['json']
      },
      {
        name: 'All', extensions: ['*']
      }]
  })

  promise.then(result => {
    if (!result.canceled) {
      const filePaths = result.filePaths
      if (filePaths !== null && filePaths.length === 1) {
        // Do something with the file path
        callback(filePaths[0])
      }
    }
  })
}

module.exports = openResultFile

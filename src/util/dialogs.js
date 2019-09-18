import { dialog } from 'electron'
import logger from 'electron-log'

/**
 * Open the file selector and do an action with the file path.
 * TODO replace callback with promise
 *
 * @param callback - The action to do with the file path
 */
function openResultFile (callback) {
  logger.info('Open result file selection')

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
        logger.info(`File selected with success : ${filePaths[0]}`)
        // Do something with the file path
        callback(filePaths[0])
      } else {
        logger.warn('Bad file selection path value', filePaths)
      }
    } else {
      logger.info('Open result file canceled')
    }
  })
}

export default openResultFile

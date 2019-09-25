import logger from 'electron-log'
import { dialog, remote } from 'electron'

/**
 * Open the result file selector from the main process.
 *
 * @async
 * @return {Promise<string>} A promise with the file absolute path
 */
export function openResultFileMain () {
  return openResultFile(dialog)
}

/**
 * Open the result file selector from the renderer process.
 *
 * @async
 * @return {Promise<string>} A promise with the file absolute path
 */
export function openResultFileRemote () {
  return openResultFile(remote.dialog)
}

function openResultFile (currentDialog) {
  logger.info('Open result file selection')

  const promise = currentDialog.showOpenDialog(null, {
    properties: ['openFile'],
    message: 'Select one result file', // Message for mac only
    filters: [
      {
        name: 'JSON', extensions: ['json']
      },
      {
        name: 'All', extensions: ['*']
      }]
  })

  // Return the promise
  return promise.then(result => {
    if (!result.canceled) {
      const filePaths = result.filePaths
      if (filePaths !== null && filePaths.length === 1) {
        logger.info(`File selected with success : ${filePaths[0]}`)
        return filePaths[0]
      } else {
        logger.warn('Bad file selection path value', filePaths)
        throw new Error('Bad file selection path value')
      }
    } else {
      logger.info('Open result file canceled')
      throw new Error('Open result file canceled')
    }
  })
}

/**
 * Open the spec files selector from the main process.
 *
 * @async
 * @return {Promise<Array<string>>} A promise with the files absolute path
 */
export function openSpecFilesMain () {
  return openSpecFiles(dialog)
}

/**
 * Open the spec files selector from the renderer process.
 *
 * @async
 * @return {Promise<Array<string>>} A promise with the files absolute paths
 */
export function openSpecFilesRenderer () {
  return openSpecFiles(remote.dialog)
}

function openSpecFiles (currentDialog) {
  logger.info('Open spec files selection')

  const promise = currentDialog.showOpenDialog(null, {
    properties: ['openFile', 'openDirectory', 'multiSelections'],
    message: 'Select one or many spec files / directories', // Message for mac only
    filters: [
      {
        name: 'DPS', extensions: ['dps']
      },
      {
        name: 'All', extensions: ['*']
      }]
  })

  // Return the promise
  return promise.then(result => {
    if (!result.canceled) {
      const filePaths = result.filePaths
      if (filePaths !== null && filePaths.length >= 1) {
        logger.info(
          `${filePaths.length} file(s) selected with success : ${filePaths.join(', ')}`)
        return filePaths
      } else {
        logger.warn('Bad file selection path value', filePaths)
        throw new Error('Bad file selection path value')
      }
    } else {
      logger.info('Open spec file canceled')
      throw new Error('Open spec file canceled')
    }
  })
}

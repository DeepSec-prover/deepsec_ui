import userSettings from 'electron-settings'
import logger from 'electron-log'

const spawn = require('child_process').spawn;

/**
 * Run a command through Deepsec API.
 *
 * @param {Object} cmd The JSON command structure
 * @param mainWindow The main windows reference (for IPC)
 * @return {string} Error message or null if everything is good
 */
function runCmd (cmd, mainWindow) {
  let apiPath = userSettings.get('deepsecApiPath')

  if (!apiPath || apiPath.length === 0) {
    return 'DeepSec API path is not set'
  }
  // TODO check file exist

  logger.info(`First API call : ${apiPath}`)
  let process = spawn(apiPath)

  let cmdStr = JSON.stringify(cmd)
  logger.info(`Send command to API : ${cmdStr}`)
  process.stdin.write(cmdStr + '\n')

  process.stdout.on('data', (data) => {
    // Send ui notification
    mainWindow.webContents.send('notification:show', 'Test title', data, 'error')
  })

  // child.stdin.end(); TODO after the end
}

export default runCmd

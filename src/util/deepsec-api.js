import userSettings from 'electron-settings'
import logger from 'electron-log'

const spawn = require('child_process').spawn;

function runCmd (cmd) {
  let apiPath = userSettings.get('deepsecApiPath')

  logger.info(`First API call : ${apiPath}`)
  let process = spawn(apiPath)

  let cmdStr = JSON.stringify(cmd)
  logger.info(`Send command to API : ${cmdStr}`)
  process.stdin.write(cmdStr + '\n')
  // process.stdin.end()

  process.stdout.on('data', (data) => {
    logger.info(`Response : ${data}`)
  })
}

export default runCmd

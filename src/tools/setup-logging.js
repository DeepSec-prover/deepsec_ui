const { app } = require('electron')
const fs = require('fs')
const logger = require('electron-log')
const path = require('path')
const settings = require('../../settings')

/**
 * Set up the default global logger.
 * Will log in console and in a file.
 * The log file is stored in user log directory if packaged or in project root if not.
 */
function setupDefaultLogger () {
  let logDir = null

  // Get and create the log directory for the current user depending of the OS
  if (app.isPackaged) {
    app.setAppLogsPath() // Create
    logDir = app.getPath('logs')
  }
  // For dev create at project root
  else {
    logDir = path.join(settings.appRoot, 'log')

    // Create the log directory if it does not exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir)
    }
  }

  const logFile = path.join(logDir, 'app.log')

  // Console Settings
  logger.transports.console.format = '{h}:{i}:{s}.{ms} [{processType}] {level} - {text}'
  logger.transports.console.level = settings.logLevelConsole
  logger.transports.console.forceStyles = true

  // File Settings
  logger.transports.file.level = settings.logLevelFile
  logger.transports.file.file = logFile
  logger.transports.file.maxSize = 5242880 // 5MB

  // TODO Handled error management
  // logger.catchErrors({onError (error) {}})

  logger.info(`Logger setup: console and file (${logFile})`)
}

module.exports = setupDefaultLogger

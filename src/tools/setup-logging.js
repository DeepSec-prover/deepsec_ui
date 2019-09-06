const appRoot = require('app-root-path')
const winston = require('winston')
const { transports, format } = winston
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

/**
 * Set up the default global logger.
 * Will log in console and in a file (stored in user log directory).
 */
function setupDefaultLogger () {
  const env = process.env.NODE_ENV || 'development'
  // Get and create the log directory for the current user depending of the OS
  const logDir = app.isPackaged ? app.getPath('logs') : appRoot + '/log'

  // Create the log directory if it does not exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
  }

  const logFile = path.join(logDir, 'app.log')

  // TODO Move some options in a configuration file
  const options = {
    // Console output (text)
    console: {
      level: env === 'production' ? 'warn' : 'debug',
      format: format.combine(
        format.colorize(),
        format.label({ label: path.basename(process.mainModule.filename) }),
        format.timestamp({ format: 'HH:mm:ss.SSS' }),
        format.printf(
          info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
      ),
      stderrLevels: ['error', 'warn'],
      handleExceptions: true
    },
    // File output (json)
    file: {
      level: env === 'production' ? 'info' : 'silly',
      format: format.combine(
        format.label({ label: path.basename(process.mainModule.filename) }),
        format.timestamp(),
        format.json()
      ),
      filename: logFile,
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }
  }

  // Configure the default logger
  winston.configure({
    transports: [
      new transports.Console(options.console),
      new transports.File(options.file)
    ],
    exitOnError: false // do not exit on handled exceptions
  })

  winston.info(`Logger setup: console and file (${logFile})`)
}

module.exports = setupDefaultLogger

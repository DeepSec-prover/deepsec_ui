import userSettings from 'electron-settings'
import logger from 'electron-log'
import { isEmptyOrBlankStr, isFile } from '../util/misc'
import { spawn } from 'child_process'
import { ipcMain } from 'electron'

let stdoutBuffer = ''

/**
 * To communicate with DeepSec API.
 * Can be used only on the main process. For renderer side use ApiRemote.
 * @see ApiRemote
 */
export class ApiManager {
  /**
   * Create an API manager for a specific scenario.
   * Will start a command and handle the answers.
   *
   * @param {String} namespace The namespace of this manager, used in internal signals.
   * @param {Boolean} detached If true the started process won't stop when the UI is closed.
   * @param {String} ipcId Unique identifier to send ipc command on this object.
   */
  constructor (namespace, detached, ipcId) {
    this.process = null
    this.event = null
    this.mainWindow = null
    this.namespace = namespace
    this.ipcId = ipcId
    this.detached = detached
    this.answerHandlers = []
    this.queryHandlers = []
    this.registerAllAnswers()
    this.registerAllQueries()
  }

  /**
   * Reply to the event.
   *
   * @param {Object} content The content of the reply.
   */
  eventReply (content) {
    this.event.reply(`deepsec-api:${this.namespace}`, content)
  }

  /**
   * Push a notification signal (will be caught by the main layer).
   *
   * @param {String} title The title of the notification
   * @param {String} message The content message of the notification (HTML)
   * @param {String} type The type of notification (success/warning/info/error)
   * @param {String} topic The name of the topic, for filter
   * @param {Object} link The route description for vue-router
   * @param {Object} router The vue router to use
   */
  pushNotification (title,
                    message = '',
                    type = 'info',
                    topic = 'default',
                    link = null,
                    router = null) {
    this.mainWindow.webContents.send('notification:show',
                                     title, message, type, topic, link, router)
  }

  /**
   * Send a command to the running process.
   *
   * @param {Object} command The command with options to send.
   */
  sendCommand (command) {
    let cmdStr = JSON.stringify(command)

    if (this.process === null) {
      this.unexpectedError(`Fail to send the command : ${cmdStr} because the process is
       closed or never started.`)
      return
    }

    try {
      logger.info(`Send command to API : ${cmdStr}`)
      this.process.stdin.write(cmdStr + '\n')
    } catch (e) {
      this.unexpectedError(
        `Impossible to communicate with the process. Fail to send the command : ${cmdStr}
        Error : ${e.toString()}`)
    }
  }

  /**
   * Start a command through Deepsec API.
   * Should reply to the event exactly one time.
   *
   * @param {Object} options Process command with options as a JSON object.
   * @param {Object} event The internal event that trigger the start (required for reply).
   * @param {Object} mainWindow The reference to the main window (required for notifications).
   */
  start (options, event, mainWindow) {
    if (this.process !== null) {
      throw Error('Can\'t start a process twice.')
    }

    this.event = event
    this.mainWindow = mainWindow
    const apiPath = String(userSettings.get('deepsecApiPath'))

    // Check Deepsec API path
    if (isEmptyOrBlankStr(apiPath)) {
      // Send bad result to the Start Run page
      this.eventReply({ 'success': false, 'error': 'DeepSec API path is not set' })
      logger.warn('Try to start a command but the DeepSec API path is not set')
      return
    } else if (!isFile(apiPath)) {
      // Send bad result to the Start Run page
      this.eventReply({ 'success': false, 'error': `Incorrect DeepSec API path (${apiPath})` })
      logger.warn(
        `Try to start a command but the DeepSec API path is incorrect (${apiPath})`)
      return
    }

    logger.info(`Start DeepSec API process with command : ${apiPath}`)
    // TODO set env
    this.process = spawn(apiPath, {
      detached: this.detached,
      windowsHide: true
    })

    // Allow the application to close even if the process is still running
    if (this.detached) {this.process.unref()}

    // Stdout messages catching
    this.process.stdout.on('data', (data) => {
      data = data.toString() // Convert buffer to string
      logger.silly(`DeepSec API answer chunk : ${data}`)

      // Add too buffer but no process util the end
      stdoutBuffer += data

      // Split if many commands at once
      const answers = stdoutBuffer.split('\n')

      // Send the last part to the buffer.
      // If the end was '\n' so the buffer will be set back with an empty string.
      // If their is no '\n' so the buffer won't be consumed and answers will be empty.
      stdoutBuffer = answers.pop()

      answers.forEach((a) => {
        if (!isEmptyOrBlankStr(a)) {
          this.handleAnswer(a)
        }
      })
    })

    // Stderr messages catching, should never happen
    this.process.stderr.on('data', data => {
      this.unexpectedError(`Error message from DeepSec API : ${data.toString()}`)
    })

    // Abnormal behaviours from the process
    this.process.on('error', err => {
      this.unexpectedError(`Error detected from DeepSec API : ${err.name} - ${err.message}`)
    })

    // Process exit signal
    this.process.on('exit', code => {
      if (code === 0) {
        logger.info(`DeepSec API process end correctly with exit code ${code}`)
      } else {
        this.unexpectedError(`DeepSec API process end badly with exit code ${code}`)
      }
      this.processExit()
    })

    // Process disconnected signal
    this.process.on('disconnect', () => {
      logger.debug(`DeepSec API process disconnect to current process`)
    })

    // Send first command
    this.sendCommand(options)
  }

  /**
   * Handle a new answer from the API.
   *
   * @param {String} answer A json object as a raw string.
   */
  handleAnswer (answer) {
    // Parse the answer to json
    try {
      answer = JSON.parse(answer)
    } catch (e) {
      this.unexpectedError(`Parsing error of DeepSec API answer : ${answer}`)
      return
    }

    if (this.answerHandlers[answer.command] === undefined) {
      logger.error(`Unknown DeepSec API answer command : ${answer.command} for ${this.namespace}`)
    } else {
      logger.debug(`Processing command ${answer.command} for ${this.namespace}`)
      this.answerHandlers[answer.command](answer)
    }
  }

  /**
   * For any unexpected behaviours during the run process (should not happen in production).
   *
   * @param {String} message The error message
   */
  unexpectedError (message) {
    logger.error(message)

    // Send bad result to the Start Run page (if already for an answer this will be ignored)
    this.eventReply({ 'success': false, 'error': message })

    // Send ui notification
    this.pushNotification('Unexpected error', message, 'error', 'default')
  }

  /**
   * Close the communication with the process.
   */
  processExit () {
    logger.info('Close the communication with the API process.')
    this.process.stdin.end()
    this.process = null
  }

  /**
   * Register an answer handler for a specific command. (API -> UI)
   *
   * @param {String} command The name of the answer command to handle.
   * @param {Function} handler The function to run when the command is received. Will have the
   * answer as parameter (an object).
   */
  addAnswerHandler (command, handler) {
    if (this.answerHandlers[command] !== undefined) {
      throw Error(`An answer can only have one handler (${command}).`)
    }

    this.answerHandlers[command] = handler.bind(this) // bind "this" to fix the good context
  }

  /**
   * Override and register every command handler here.
   */
  registerAllAnswers () {
    // Use addAnswerHandler to register every command here
    throw new TypeError('Must override method')
  }

  /**
   * Register an query handler for a specific command. (UI -> API)
   *
   * @param {String} command The name of the query command to handle.
   * @param {Function} handler The function to run when the command is received. Will have
   * 2 parameters : the event and the arguments.
   */
  addQueryHandler (command, handler) {
    if (this.queryHandlers[command] !== undefined) {
      throw Error(`A query can only have one handler (${command}).`)
    }

    ipcMain.on(`deepsec-api:${this.namespace}:${this.ipcId}:${command}`, handler.bind(this))

    this.queryHandlers[command] = true // Just to keep track
  }

  /**
   * Override and register every query handler here.
   */
  registerAllQueries () {
    // Use addQueryHandler to register every command here
  }
}

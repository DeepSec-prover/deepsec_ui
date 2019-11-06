import userSettings from 'electron-settings'
import logger from 'electron-log'
import { isEmptyOrBlankStr, isFile } from './misc'
import { spawn } from 'child_process'
import BatchModel from '../models/BatchModel'
import RunModel from '../models/RunModel'
import QueryModel from '../models/QueryModel'

/**
 * Run a command through Deepsec API.
 * Should reply to the event exactly one time.
 *
 * @param {Object} cmd The JSON command structure
 * @param event The event to replay
 * @param mainWindow The main windows reference (for IPC)
 */
function runCmd (cmd, event, mainWindow) {
  let apiPath = String(userSettings.get('deepsecApiPath'))

  // Check Deepsec API path
  if (isEmptyOrBlankStr(apiPath)) {
    // Send bad result to the Start Run page
    event.reply('deepsec-api:result', { 'success': false, 'error': 'DeepSec API path is not set' })
    return
  } else if (!isFile(apiPath)) {
    // Send bad result to the Start Run page
    event.reply('deepsec-api:result',
                { 'success': false, 'error': `Incorrect DeepSec API path (${apiPath})` })
    return
  }

  logger.info(`Start DeepSec API process with command : ${apiPath}`)
  // TODO set env
  let process = spawn(apiPath, {
    detached: true,
    windowsHide: true
  })
  // Allow the application to close even if the process is still running
  process.unref()

  // Stdout messages catching
  process.stdout.on('data', (data) => {
    // Convert buffer to string
    data = data.toString()
    logger.silly(`DeepSec API answer : ${data}`)
    // Split if many commands at once
    let answers = data.split('\n')

    answers.forEach((a) => {
      if (!isEmptyOrBlankStr(a)) {
        handleAnswer(a, process, event, mainWindow)
      }
    })
  })

  // Stderr messages catching, should never happen
  process.stderr.on('data', data => {
    unexpectedError(event, mainWindow,
                    `Error message from DeepSec API : ${data.toString()}`)
  })

  // Abnormal behaviours from the process
  process.on('error', err => {
    unexpectedError(event, mainWindow,
                    `Error detected from DeepSec API : ${err.name} - ${err.message}`)
  })

  // Process exit signal
  process.on('exit', code => {
    logger.info(`DeepSec API process exit with code ${code}`)
  })

  // Process disconnected signal
  process.on('disconnect', () => {
    logger.debug(`DeepSec API process disconnect to current process`)
  })

  // Send first
  let cmdStr = JSON.stringify(cmd)
  logger.info(`Send command to API : ${cmdStr}`)
  process.stdin.write(cmdStr + '\n')
}

function handleAnswer (answer, process, event, mainWindow) {
  try {
    answer = JSON.parse(answer)
  } catch (e) {
    unexpectedError(event, mainWindow, `Parsing error of DeepSec API answer : ${answer}`)
    return
  }

  switch (answer.command) {
    // --- Normal ---
    case 'batch_started':
      batchStarted(answer, event, mainWindow) // Notification and event reply
      break
    case 'run_started':
      runStarted(answer, mainWindow) // Notification
      break
    case 'query_started':
      queryStarted(answer, mainWindow) // Notification
      break
    case 'query_ended':
      queryEnded(answer, mainWindow) // Notification
      break
    case 'run_ended':
      runEnded(answer, mainWindow) // Notification
      break
    case 'batch_ended':
      batchEnded(answer, mainWindow) // Notification
      break
    // --- Exit ---
    case 'exit':
      processExit(process) // Silent for the user
      break
    // --- Error ---
    case 'init_internal_error':
      initInternalError(answer, event) // Event reply
      break
    case 'user_error':
      userError(answer, event) // Event reply
      break
    case 'batch_internal_error':
      batchEnded(answer, mainWindow) // Notification, use batch ended
      break
    case 'query_internal_error':
      queryEnded(answer, mainWindow) // Notification, use query ended
      break
    default:
      logger.error(`Unknown DeepSec API answer command : ${answer.command}`)
  }
}

// ====================== Normal Answers ======================

function batchStarted (answer, event, mainWindow) {
  // Send good result to the Start Run page
  event.reply('deepsec-api:result', { 'success': true })

  // Started with warning
  if (answer.warning_runs && answer.warning_runs.length > 0) {
    let nbFilesWarning = answer.warning_runs.length
    let nbTotalWarning = answer.warning_runs.reduce((sum, a) => sum + a.warnings.length, 0)

    // Send ui notification
    mainWindow.webContents.send('notification:show',
                                `Batch started with warnings`,
                                `${nbTotalWarning} warning${nbTotalWarning > 1 ? 's' : ''} in
                                 ${nbFilesWarning} file${nbFilesWarning > 1 ? 's' : ''}`,
                                'warning',
                                'batch',
                                { name: 'batch', params: { 'path': answer.file } }
    )
  } else {
    // Send ui notification
    mainWindow.webContents.send('notification:show',
                                'Batch started',
                                '',
                                'info',
                                'batch',
                                { name: 'batch', params: { 'path': answer.file } })
  }
}

function runStarted (answer, mainWindow) {
  let run = new RunModel(answer.file)
  run.loadBatch()
  // Send ui notification
  mainWindow.webContents.send('notification:show',
                              `Run ${run.title()} started`,
                              `From batch ${run.batch.title()} <br> Run ${run.batch.runIndex(
                                run)} / ${run.batch.nbRun()}`,
                              'info',
                              'run',
                              { name: 'run', params: { 'path': answer.file } })
}

function queryStarted (answer, mainWindow) {
  let query = new QueryModel(answer.file)
  query.loadRun()
  // Send ui notification
  mainWindow.webContents.send('notification:show',
                              `Query ${query.title()} started`,
                              `From run ${query.run.title()} <br> Query ${query.index} / ${query.run.nbQueries()}`,
                              'info',
                              'query',
                              { name: 'query', params: { 'path': answer.file } })
}

function queryEnded (answer, mainWindow) {
  let title
  let type
  let query = new QueryModel(answer.file)
  query.loadRun()
  switch (answer.status) {
    case 'completed':
      title = `Query ${query.title()} completed`
      type = 'success'
      break
    case 'canceled':
      title = `Query ${query.title()} canceled`
      type = 'warning'
      break
    case 'internal_error':
      title = `Query ${query.title()} internal error`
      type = 'error'
      break
    default:
      logger.error(`Unknown query status : ${answer.status}`)
      title = `Query ${query.title()} ended (${answer.status})`
      type = 'error'
  }

  // Send ui notification
  mainWindow.webContents.send('notification:show',
                              title,
                              `From run ${query.run.title()} <br> Query ${query.index} / ${query.run.nbQueries()}`,
                              type,
                              'query',
                              { name: 'query', params: { 'path': answer.file } })
}

function runEnded (answer, mainWindow) {
  let title
  let type
  let run = new RunModel(answer.file)
  run.loadBatch()
  switch (answer.status) {
    case 'completed':
      title = `Run ${run.title()} completed`
      type = 'success'
      break
    case 'canceled':
      title = `Run ${run.title()} canceled`
      type = 'warning'
      break
    case 'internal_error':
      title = `Run ${run.title()} internal error`
      type = 'error'
      break
    default:
      logger.error(`Unknown run status : ${answer.status}`)
      title = `Run ${run.title()} ended (${answer.status})`
      type = 'error'
  }

  // Send ui notification
  mainWindow.webContents.send('notification:show',
                              title,
                              `From batch ${run.batch.title()} <br> Run ${run.batch.runIndex(
                                run)} / ${run.batch.nbRun()}`,
                              type,
                              'run',
                              { name: 'run', params: { 'path': answer.file } })
}

function batchEnded (answer, mainWindow) {
  let title
  let type
  let batch = new BatchModel(answer.file, true) // Load with runs
  let nbRun = batch.nbRun()
  let runStatus = batch.runsStatusCount()

  switch (answer.status) {
    case 'completed':
      title = `Batch ${batch.title()} completed`
      type = 'success'
      break
    case 'canceled':
      title = `Batch ${batch.title()} canceled`
      type = 'warning'
      break
    case 'internal_error':
      title = `Batch ${batch.title()} internal error`
      type = 'error'
      break
    default:
      logger.error(`Unknown batch status : ${answer.status}`)
      title = `Batch ${batch.title()} ended (${answer.status})`
      type = 'error'
  }

  // TODO use vue component for notification message (if possible)
  // Send ui notification
  mainWindow.webContents.send('notification:show',
                              title,
                              `Batch of ${nbRun} run${nbRun > 1 ? 's' : ''}.
                              <ul>
                                <li>${runStatus['completed']} completed</li>
                                <li>${runStatus['canceled']} canceled</li>
                                <li>${runStatus['internal_error']} error</li>
                              </ul>
                              `,
                              type,
                              'batch',
                              { name: 'batch', params: { 'path': answer.file } })
}

// ======================= Error Answers ======================

function initInternalError (answer, event) {
  // Send bad result to the Start Run page
  event.reply('deepsec-api:result', { 'success': false, 'error': answer.error_msg })
}

function userError (answer, event) {
  let nbFilesIssue = answer.error_runs.length
  let nbTotalWarnings = 0
  let nbTotalError = 0

  answer.error_runs.forEach(error => {
    if (!isEmptyOrBlankStr(error.error_msg)) {
      nbTotalError++
    }
    if (error.warning) {
      nbTotalWarnings += error.warning.length
    }
  })

  // Send bad result to the Start Run page
  event.reply('deepsec-api:result', {
    'success': false,
    'error': `${nbTotalError} error${nbTotalError > 1 ? 's' : ''} and
    ${nbTotalWarnings} warning${nbTotalWarnings > 1 ? 's' : ''} in
    ${nbFilesIssue} file${nbFilesIssue > 1 ? 's' : ''}`,
    'files_issues': answer.error_runs
  })
}

/**
 * For any unexpected behaviours during the run process (should not happen in production).
 *
 * @param event The start run event
 * @param mainWindow The main window for notification
 * @param message The error message
 */
function unexpectedError (event, mainWindow, message) {
  logger.error(message)

  // Send bad result to the Start Run page (if already for an answer this will be ignored)
  event.reply('deepsec-api:result', { 'success': false, 'error': message })

  // Send ui notification
  mainWindow.webContents.send('notification:show',
                              'Unexpected error',
                              message,
                              'error',
                              'default')
}

// ======================== Exit Answer =======================

function processExit (process) {
  process.stdin.end()
}

export default runCmd

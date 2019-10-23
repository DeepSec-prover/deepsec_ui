import userSettings from 'electron-settings'
import logger from 'electron-log'
import { isEmptyOrBlankStr, isFile } from './misc'
import { spawn } from 'child_process'

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
    logger.error(`Error message from DeepSec API : ${data.toString()}`)
  })

  // Abnormal behaviours from the process
  process.on('error', err => {
    logger.error(`Error detected from DeepSec API : ${err.name} - ${err.message}`)
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
    logger.error(`Error in DeepSec API answer parsing : ${answer}`)
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
      batchInternalError(answer, mainWindow) // Notification
      break
    case 'query_internal_error':
      queryInternalError(answer, mainWindow) // Notification
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
      'Batch started with warnings',
      `Result file : ${answer.file} <br>
      ${nbTotalWarning} warning${nbTotalWarning > 1 ? 's' : ''} in
      ${nbFilesWarning} file${nbFilesWarning > 1 ? 's' : ''}`,
      'warning',
      'batch')
  } else {
    // Send ui notification
    mainWindow.webContents.send('notification:show',
      'Batch started',
      `Result file : ${answer.file}`,
      'info',
      'batch')
  }
}

function runStarted (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Run started',
    `Result file : ${answer.file}`,
    'info',
    'run')
}

function queryStarted (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Query started',
    `Result file : ${answer.file}`,
    'info',
    'query')
}

function queryEnded (answer, mainWindow) {
  let title
  let type
  switch (answer.status) {
    case 'completed':
      title = 'Query completed'
      type = 'success'
      break
    case 'canceled':
      title = 'Query canceled'
      type = 'warning'
      break
    default:
      logger.error(`Unknown query status : ${answer.status}`)
      title = `Query ended (${answer.status})`
      type = 'error'
  }

  // Send ui notification
  mainWindow.webContents.send('notification:show',
    title,
    `Result file : ${answer.file}`,
    type,
    'query')
}

function runEnded (answer, mainWindow) {
  let title
  let type
  switch (answer.status) {
    case 'completed':
      title = 'Run completed'
      type = 'success'
      break
    case 'canceled':
      title = 'Run canceled'
      type = 'warning'
      break
    case 'internal_error':
      title = 'Run internal error'
      type = 'error'
      break
    default:
      logger.error(`Unknown run status : ${answer.status}`)
      title = `Run ended (${answer.status})`
      type = 'error'
  }

  // Send ui notification
  mainWindow.webContents.send('notification:show',
    title,
    `Result file : ${answer.file}`,
    type,
    'run')
}

function batchEnded (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Batch completed',
    `Result file : ${answer.file}`,
    'success',
    'batch')
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
    'files_issues': answer.error_runs })
}

function batchInternalError (answer, event, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Internal error',
    `${answer.error_msg}<br>Result file : ${answer.file}`,
    'error',
    'batch')
}

function queryInternalError (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Internal query error',
    `${answer.error_msg}<br>Result file : ${answer.file}`,
    'error',
    'query')
}

// ======================== Exit Answer =======================

function processExit (process) {
  process.stdin.end()
}

export default runCmd

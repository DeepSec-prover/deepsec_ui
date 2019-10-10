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

  // Stderr messages catching
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
      batchStarted(answer, event, mainWindow)
      break
    case 'run_started':
      runStarted(answer, mainWindow)
      break
    case 'query_started':
      queryStarted(answer, mainWindow)
      break
    case 'query_ended':
      queryEnded(answer, mainWindow)
      break
    case 'run_ended':
      runEnded(answer, mainWindow)
      break
    case 'batch_ended':
      batchEnded(answer, mainWindow)
      break
    // --- Exit ---
    case 'exit':
      processExit(process)
      break
    // --- Error ---
    case 'init_internal_error':
      initInternalError(answer, event)
      break
    case 'user_error':
      userError(answer, event)
      break
    case 'batch_internal_error':
      batchInternalError(answer, mainWindow)
      break
    case 'query_internal_error':
      queryInternalError(answer, mainWindow)
      break
    default:
      logger.error(`Unknown DeepSec API answer command : ${answer.command}`)
  }
}

// ====================== Normal Answers ======================

function batchStarted (answer, event, mainWindow) {
  // Send good result to the Start Run page
  event.reply('deepsec-api:result', { 'success': true, 'files_issues': answer.warning_runs })
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Batch started',
    `Result file : ${answer.file}`,
    'info')
  // TODO handle warnings
}

function runStarted (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Run started',
    `Result file : ${answer.file}`,
    'info')
}

function queryStarted (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Query started',
    `Result file : ${answer.file}`,
    'info')
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
    type)
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
    type)
}

function batchEnded (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Batch completed',
    `Result file : ${answer.file}`,
    'success')
}

// ======================= Error Answers ======================

function initInternalError (answer, event) {
  // Send bad result to the Start Run page
  event.reply('deepsec-api:result', { 'success': false, 'error': answer.error_msg })
}

function userError (answer, event) {
  // Send bad result to the Start Run page
  event.reply('deepsec-api:result', { 'success': false, 'files_issues': answer.error_runs })
}

function batchInternalError (answer, event, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Internal error',
    `${answer.error_msg}<br>Result file : ${answer.file}`,
    'error')
}

function queryInternalError (answer, mainWindow) {
  // Send ui notification
  mainWindow.webContents.send('notification:show',
    'Internal query error',
    `${answer.error_msg}<br>Result file : ${answer.file}`,
    'error')
}

// ======================== Exit Answer =======================

function processExit (process) {
  process.stdin.end()
}

export default runCmd

import userSettings from 'electron-settings'
import logger from 'electron-log'
import { isEmptyOrBlankStr } from './misc'
import { spawn } from 'child_process'

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
  // TODO set env and try detached
  let process = spawn(apiPath)

  let cmdStr = JSON.stringify(cmd)
  logger.info(`Send command to API : ${cmdStr}`)
  process.stdin.write(cmdStr + '\n')

  process.stdout.on('data', (data) => {
    // Convert buffer to string
    data = data.toString()
    logger.silly(`DeepSec API answer : ${data}`)
    // Split if many commands at once
    let answers = data.split('\n')

    answers.forEach((a) => {
      if (!isEmptyOrBlankStr(a)) {
        handleAnswer(a, process, mainWindow)
      }
    })
  })

  // child.stdin.end(); TODO after the end
}

function handleAnswer (answer, process, mainWindow) {
  try {
    answer = JSON.parse(answer)
  } catch (e) {
    logger.error(`Error in DeepSec API answer parsing : ${answer}`)
    return
  }

  switch (answer.command) {
    case 'batch_started':
      batchStarted(answer, mainWindow)
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
    case 'exit':
      processExit(process)
    default:
      logger.error(`Unknown DeepSec API answer command : ${answer.command}`)
  }
}

function batchStarted (answer, mainWindow) {
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

function processExit (process) {
  // TODO process exit
}


export default runCmd

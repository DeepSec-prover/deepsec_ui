const { ipcRenderer } = require('electron')
const logger = require('electron-log')
const formatProcess = require('../tools/process-parser')
const fs = require('fs')
const path = require('path')
const settings = require('../../settings')
require('../../static/js/prism') // TODO use npm package ?
require('../tools/deepsec-language')

/**
 * Parse ans show a result file to the app.
 *
 * @param {string} filePath The path to the json result file.
 */
function showResult (filePath) {

  logger.info(`Opening a process from file: ${filePath}`)

  let result = ''

  try {
    result = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (e) {
    // TODO show better error to the user
    result = `<strong>Fail to load the file ${filePath}</strong>`
    logger.error(`Fail to load the file ${filePath}`)
  }

  document.getElementById('process').innerHTML =
    formatProcess(result.process1, result.atomic_data)
}

// Wait to receive a path to a result file, then show it on the page
ipcRenderer.on('result:show', (event, filePath) => {
  logger.debug('Received IPC message : result:show')
  showResult(filePath)
  Prism.highlightAll()
})

// For fast test
if (settings.mockDataAsDefault) {
  showResult(path.join(__dirname, '../../mock-data/process_example.json'))
}

const { ipcRenderer } = require('electron')
const formatProcess = require('../tools/process-parser')
const fs = require('fs')
require('../../static/js/prism') // TODO use npm package ?
require('../tools/deepsec-language')

function showResult (filePath) {
  // TODO handle parsing errors and bad path
  const result = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  document.getElementById('process').innerHTML =
    formatProcess(result.process1, result.atomic_data)

  Prism.highlightAll()
}

// Wait to receive a path to a result file, then show it on the page
ipcRenderer.on('result:show', (event, filePath) => {
  showResult(filePath)
})

// TODO remove if no debug
showResult('mock-data/process_example.json')

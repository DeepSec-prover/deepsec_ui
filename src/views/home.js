const { ipcRenderer } = require('electron')
const jsonProcessToHtml = require('../tools/process-parser')
const fs = require('fs')

// Wait to receive a path to a result file, then show it on the page
ipcRenderer.on('result:show', (event, filePath) => {
  // TODO handle parsing errors and bad path
  const result = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  document.getElementById('process').innerText =
    jsonProcessToHtml(result.process1, result.atomic_data)
})

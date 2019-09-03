const fs = require('fs')
const jsonProcessToHtml = require('./tools/process_parser')

window.addEventListener('DOMContentLoaded', () => {
  const evalResult = JSON.parse(fs.readFileSync(
    './mock-data/process_example.json',
    'utf8'))

  document.getElementById('process').innerText =
    jsonProcessToHtml(evalResult.process1, evalResult.atomic_data)
})

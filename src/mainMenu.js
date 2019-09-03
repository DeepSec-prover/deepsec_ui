const { app } = require('electron')

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click () {
          app.quit()
        }
      }
    ]
  }
]

// ==================== Development Tools ====================
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Dev Tools',
    submenu: [
      {
        label: 'Toggle inspector',
        accelerator: 'F12',
        click (item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        label: 'Reload',
        accelerator: 'F5',
        role: 'reload'
      }
    ]
  })
}

module.exports = mainMenuTemplate

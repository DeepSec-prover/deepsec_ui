const { app } = require('electron')
const logger = require('electron-log')
const openResultFile = require('./tools/dialogs')
const settings = require('../settings')

/**
 * Select the good command depending of the current system.
 *
 * @returns {string} Command for macOS and Ctrl for Windows or Linux
 */
function ctrl () {
  return process.platform === 'darwin' ? 'Command' : 'Ctrl'
}

/**
 * Create the template for the application main menu
 * TODO Try to remove the main windows reference (send to all windows ?)
 *
 * @param mainWindow - The main windows reference
 * @returns {{submenu: *[], label: string}[]}
 */
function mainMenuTemplate (mainWindow) {
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: ctrl() + '+O',
          click () {
            openResultFile(filePath => {
              // Send file path only because full object is too big
              logger.debug('Send IPC message : result:show')
              mainWindow.webContents.send('result:show', filePath)
            })
          }
        },
        {
          label: 'Quit',
          accelerator: ctrl() + '+Q',
          click () {
            app.quit()
          }
        }
      ]
    }
  ]

  // ==================== Development Tools ====================
  if (settings.devTools.menu) {
    menuTemplate.push({
      label: 'Dev Tools',
      submenu: [
        {
          label: 'Toggle inspector',
          accelerator: process.platform === 'darwin' ? 'Command+I' : 'F12',
          role: 'toggleDevTools'
        },
        {
          label: 'Reload',
          accelerator: process.platform === 'darwin' ? 'Command+R' : 'F5',
          role: 'reload'
        }
      ]
    })
  }
  return menuTemplate
}

module.exports = mainMenuTemplate

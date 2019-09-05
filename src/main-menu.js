const { app } = require('electron')
const openResultFile = require('./tools/dialogs')

/**
 * Select the good command depending of the current system
 * @returns {string} Command for macOS and Ctrl for Windows or Linux
 */
function ctrl () {
  return process.platform === 'darwin' ? 'Command' : 'Ctrl'
}

/**
 * Create the template for the application main menu
 * TODO Try to remove the main windows reference
 *
 * @param mainWindow - The main windows reference
 * @returns {{submenu: *[], label: string}[]}
 */
function mainMenuTemplate (mainWindow) {
  let menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: ctrl() + '+O',
          click () {
            console.log('EMIT result:show')

            openResultFile(filePath => {
              console.log(filePath)
              // Send file path only because full object is too big
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
  if (process.env.NODE_ENV !== 'production') {
    menuTemplate.push({
      label: 'Dev Tools',
      submenu: [
        {
          label: 'Toggle inspector',
          accelerator: 'F12',
          role: 'toggleDevTools'
        },
        {
          label: 'Reload',
          accelerator: 'F5',
          role: 'reload'
        }
      ]
    })
  }
  return menuTemplate
}

module.exports = mainMenuTemplate
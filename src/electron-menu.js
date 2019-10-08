import { app } from 'electron'
import logger from 'electron-log'
import { openResultFileMain } from './util/open-files-dialogs'
import settings from '../settings'

/**
 * @type {string} "Command" for macOS and "Ctrl" for Windows or Linux
 */
const CTRL = process.platform === 'darwin' ? 'Command' : 'Ctrl'

/**
 * Create the template for the application main menu
 * TODO Try to remove the main windows reference (send to all windows ?)
 *
 * @param {Object} mainWindow The main windows reference (for IPC)
 * @returns {{submenu: *[], label: string}[]}
 */
function mainMenuTemplate (mainWindow) {
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: CTRL + '+O',
          click () {
            openResultFileMain().then(filePath => {
              // Send file path only because full object is too big
              logger.debug('Send IPC message : result:show')
              mainWindow.webContents.send('result:show', filePath)
            }).catch((_) => {
              // Nothing to do if canceled or bad value
            })
          }
        },
        {
          label: 'Quit',
          accelerator: CTRL + '+Q',
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

export default mainMenuTemplate

import { app } from 'electron'
import logger from 'electron-log'
import { openResultFileMain } from './util/open-files-dialogs'
import settings from '../settings'

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
          accelerator: 'CmdOrCtrl+O',
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
          accelerator: 'CmdOrCtrl+Q',
          click () {
            app.quit()
          }
        },
        { type: "separator" },
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Zoom In", accelerator: "CmdOrCtrl+numadd", role: "zoomIn" },
        { label: "Zoom Out", accelerator: "CmdOrCtrl+numsub", role: "zoomOut" },
      ]
    }
  ]

  // =================== MacOS basic actions ===================
  if (process.platform === 'darwin') {
    menuTemplate[0].submenu = menuTemplate[0].submenu.concat([
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" },
    ])
  }

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

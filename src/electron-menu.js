import { app, shell } from 'electron'
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

const isMac = process.platform === 'darwin'

function mainMenuTemplate (mainWindow) {

  // Edit Menu
  let editMenu = {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ]
  }

  let fileMenu = {
    label: 'File',
    submenu: [
      { label: 'New run', accelerator: 'CmdOrCtrl+N' },
      { label: 'Cancel all runs' },
      { label: 'View all results', accelerator: 'CmdOrCtrl+R' },
      { type: 'separator' },
      { label: 'Export results', accelerator: 'CmdOrCtrl+E' },
      { label: 'Import results', accelerator: 'CmdOrCtrl+I' },
      { type: 'separator' },
      ...(isMac ? [
        { role : 'close' }
      ] : [
        { role : 'about' },
        { label : 'License' },
        { label : 'Version 1.0', enabled: false },
        { label : 'Check for update' },
        { type: 'separator' },
        { label : 'Settings', accelerator: 'Ctrl+,' },
        { role: 'quit' }
      ])
    ]
  }

  let viewMenu = {
    label: 'View',
    submenu: [
      { role: 'toggleDevTools', accelerator: isMac ? 'Shift+Command+I' : 'F12' },
      { role: 'reload', accelerator: isMac ? 'Shift+Command+R' : 'F5'},
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }

  let windowMenu = {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [] : [
        { role: 'close' }
      ])
    ]
  }

  let helpMenu = {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Official Website',
        click: async () => {
            await shell.openExternal('https://deepsec-prover.github.io')
          }
      },
      { label: 'Documentation' },
      {
        label: 'Report a bug',
        click: async () => {
          await shell.openExternal('https://github.com/DeepSec-prover/deepsec_ui/issues/new')
        }
      }
    ]
  }

  let appMenu = {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { label: 'License' },
      { label: 'Version 1.0', enabled: false },
      { label: 'Check for update' },
      { type: 'separator' },
      { label : 'Settings', accelerator: 'Cmd+,' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }

  const menuTemplate = [fileMenu,editMenu,viewMenu,windowMenu,helpMenu]

  if (isMac) {
    menuTemplate.unshift(appMenu)
  }

  return menuTemplate
}

export default mainMenuTemplate

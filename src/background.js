import { app, BrowserWindow, dialog, ipcMain, Menu, protocol } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import mainMenuTemplate from './electron-menu'
import settings from '../settings'
import setupDefaultLogger from './util/setup-logging'
import logger from 'electron-log'
import { unsetToDefault } from './util/default-user-settings'
import userSettings from 'electron-settings'
import { ApiStartRun } from './deepsec-api/ApiStartRun'
import { ApiDisplayTrace } from './deepsec-api/ApiDisplayTrace'
import { ApiManager } from './deepsec-api/ApiManager'
import { ApiAttackSim } from './deepsec-api/ApiAttackSim'
import { ApiEquivalenceSim } from './deepsec-api/ApiEquivalenceSim'
import { refreshApiPath } from './util/refreshApiPath'
import fixPath from 'fix-path'
import {
  closeDatabase,
  connectDatabase,
  createTablesIfNotExist,
  scanForInProgress,
  scanForNewResults
} from './database/database'

// Fix system path for packaged MacOS (https://stackoverflow.com/a/57705752/2666094)
fixPath()
// Init default logger
setupDefaultLogger()

// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let loadingWindow

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged(
  [{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      show: false,
      width: 1200,
      height: 1000,
      minWidth: 1000,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true // To use node in the client side
      },
      icon: 'public/icons/icon.png' // Probably override by the packaged application (but useful for dev)
    })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }

  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('close', function (e) {
    if (ApiManager.detachedProcesses.size > 0) {
      const choice = dialog.showMessageBoxSync(this, {
        type: 'question',
        buttons: ['Quit and cancel the queries', 'Quit and keep the verification in background', 'Cancel'],
        title: 'Confirm',
        message: 'You are about to quit DeepSec UI but some queries are still being verified. What do yo want to do ?'
      })

      if (choice === 0) {
        ApiManager.cancelDetachedIO()
      } else if (choice === 2) {
        e.preventDefault()
      }
    }
  })

  // Attache the menu to the window
  Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate(mainWindow)))

  if (settings.devTools.startUp) {
    mainWindow.webContents.openDevTools()
  }

  logger.info('Main windows created')
}

function createLoadingWindow () {
  // Create the loading window.
  loadingWindow = new BrowserWindow(
    {
      show: true,
      width: 800,
      height: 320,
      frame: false,
      backgroundColor: '#154C62',
      center: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      fullscreenable: false,
      icon: 'public/icons/icon-loading.png' // Probably override by the packaged application (but useful for dev)
    })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    loadingWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'loading.html')
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    loadingWindow.loadURL('app://./loading.html')
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  logger.info('Electron app ready')

  createLoadingWindow()

  // Set user settings to default if never set or missing
  unsetToDefault()
  logger.debug(`User settings storage path : ${userSettings.file()}`)

  if (settings.env !== 'production') {
    logger.warn(`Not in production mode (current env: ${settings.env})`)
  }
  if (settings.devTools.startUp || settings.devTools.menu) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools()
    } catch (e) {
      logger.error('Vue Devtools failed to install:', e.toString())
    }
  }

  // Every API manager that you want to use with the remote has to be in this list.
  ApiManager.registerManagers([ApiStartRun, ApiDisplayTrace, ApiAttackSim, ApiEquivalenceSim],
    () => mainWindow)

  // Connect the database
  connectDatabase()
    .then(() => {
      return createTablesIfNotExist()
    })
    .then(() => {
      logger.info('Database ready')
      scanForNewResults()
      scanForInProgress()
      createWindow()
    })
    .catch(() => {
      logger.error('Fail to connect to the database, force close the application')
      // TODO maybe find a way to send an explicit error message to the user before to leave
      app.quit()
    })
})

app.on('quit', () => {
  ApiManager.closeDetachedIO()
  closeDatabase()
  logger.info('Application closed')
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  logger.info('Closing app')
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (settings.isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

/**
 * Trigger when the application is loaded and the vue is fully mounted.
 * This event is send by the vue Layout.
 */
ipcMain.once('app-loaded', () => {
  logger.info('Application fully loaded (electron + vue)')
  loadingWindow.destroy()
  mainWindow.show()
  refreshApiPath(mainWindow)
})

/**
 * Check the current Api path.
 * Called when the user change this setting.
 */
ipcMain.on('refresh-api-path', () => {
  refreshApiPath(mainWindow)
})

/**
 * Interrupt an other process. Necessary for detached children.
 */
ipcMain.on('interrupt-child-process', (e, pid) => {
  logger.info(`Send interrupt signal to process ${pid}`)
  process.kill(pid, 'SIGINT')
})

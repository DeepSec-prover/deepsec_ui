import { app, BrowserWindow, dialog, ipcMain, Menu, protocol } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import mainMenuTemplate from './electron-menu'
import settings from '../settings'
import setupDefaultLogger from './util/setup-logging'
import logger from 'electron-log'
import { unsetToDefault } from './util/user-settings-main'
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
import defaultValues from './util/default-values'
import path from 'path'
import 'events'; // Ensure 'events' is imported to avoid issues with Electron 12+ and Node.js 14+
// This allows you to use `require` in the renderer process
// and is necessary for compatibility with Electron 12+ and Node.js 14+
import { openSpecFilesRenderer, openApiFileRenderer}  from './util/open-files-dialogs';
import * as remoteMain from '@electron/remote/main';

remoteMain.initialize(); // Initialize remote module

console.log(`Starting DeepSec UI in : ${process.defaultApp}`)

const resultsDirPath = path.join(app.getPath('userData'), '../Deepsec/result_files');
defaultValues['resultsDirPath'] = resultsDirPath

process.traceProcessWarnings = true

// Fix system path for packaged MacOS (https://stackoverflow.com/a/57705752/2666094)
fixPath()
// Init default logger
setupDefaultLogger()

// Keep a global reference of the window objects, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let loadingWindow


// vue-cli-plugin-electron-builder defines app.isPackaged for us
const isDev = !app.isPackaged;

/**
 * Resolve an asset that lives in <project-root>/public/icons/
 * During development we read it directly from disk.
 * In the packaged app it is copied to  resources/icons/*  via extraResources.
 */
function resolveIcon (filename) {
  return isDev
    ? path.join(__dirname, '..', 'public', 'icons', filename)                    // dev
    : path.join(process.resourcesPath, 'icons', filename);                      // prod
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged(
  [{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 1000,
    minWidth: 1000,
    minHeight: 600,
    enableRemoteModule: true,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration
      contextIsolation: false, // Disable context isolation
      enableRemoteModule: true,
    },
    icon: resolveIcon('icon.png')
  });
  
  remoteMain.enable(mainWindow.webContents);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    createProtocol('app');
    mainWindow.loadURL('app://./index.html');
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

  
  console.log('Main windows created')
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
      closable: true,
      fullscreenable: false,
      icon: resolveIcon('icon-loading.png') // Probably override by the packaged application (but useful for dev)
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

  createLoadingWindow()  // Set user settings to default if never set or missing
  unsetToDefault()
  logger.debug(`User settings storage path : ${userSettings.file()}`)

  if (settings.env !== 'production') {
    logger.warn(`Not in production mode (current env: ${settings.env})`)
  } 

  // Comment out this block to disable Vue DevTools
  /*
  if (settings.devTools.startUp || settings.devTools.menu) {
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      logger.error('Vue Devtools failed to install:', e.toString())
    }
  }
  */

  // Every API manager that you want to use with the remote has to be in this list.
  ApiManager.registerManagers([ApiStartRun, ApiDisplayTrace, ApiAttackSim, ApiEquivalenceSim],
    () => mainWindow)

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
  try {
    process.kill(pid, 'SIGINT');
  } catch (error) {
    logger.error(`Failed to send interrupt signal to process ${pid}: ${error.message}`);
  }
})

/* handle invocations coming from the renderer */

ipcMain.handle('specFiles:open', async (_, opts = {}) => {
  return openSpecFilesRenderer(dialog, opts.files, opts.directories);
});

ipcMain.handle('apiFile:open', async (_, opts = {}) => {
  return openApiFileRenderer(dialog, opts.value);
});


import logger from 'electron-log'
import userSettings from 'electron-settings'
import { isEmptyOrBlankStr, isFile } from './misc'
import { ApiGetConfig } from '../deepsec-api/ApiGetConfig'

/**
 * Check the current Api path and refresh the results directory path
 *
 * @param mainWindow The main window reference for notification signals.
 */
export function refreshApiPath (mainWindow) {
  // Check the Deepsec API path
  const apiPath = String(userSettings.get('deepsecApiPath'))

  if (isEmptyOrBlankStr(apiPath)) {
    logger.warn('DeepSec API path is not set')
    mainWindow.webContents.send('notification:show',
                                'DeepSec API path is not set',
                                'Please set it in the setting page.',
                                'warning',
                                'init',
                                { name: 'settings' })
  } else if (!isFile(apiPath)) {
    logger.warn(`DeepSec API path is set but the path is not valid (${apiPath})`)
    mainWindow.webContents.send('notification:show',
                                'DeepSec API path is not valid',
                                `Please change it in the setting page. Current path: "${apiPath}"`,
                                'warning',
                                'init',
                                { name: 'settings' })
  } else {
    logger.info(`DeepSec API path: ${apiPath}`)
    const apiGetConf = new ApiGetConfig(mainWindow, 'init')
    apiGetConf.start() // The answer will be catch then the process will close itself
  }
}

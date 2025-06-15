import logger from 'electron-log'
import { isEmptyOrBlankStr, isFile } from './misc'
import { ApiGetConfig } from '../deepsec-api/ApiGetConfig'
import which from 'which'
import defaultValues  from './default-values'
/**
 * Check the current Api path and refresh the results directory path
 *
 * @param mainWindow The main window reference for notification signals.
 */
export function refreshApiPath (mainWindow) {
  // Check the Deepsec API path
  let apiPath = String(defaultValues['deepsecApiPath'])
  
  let detected = false

  if (isEmptyOrBlankStr(apiPath)) {
    // Try to see if we can find it in path
    detected = true
    apiPath = which.sync('deepsec_api', { nothrow: true })
  }

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
    if (detected) {
      defaultValues['deepsecApiPath'] = apiPath
    }
    logger.info(`DeepSec API path: ${apiPath}`)
    defaultValues['deepsecApiPath'] = apiPath
    const apiGetConf = new ApiGetConfig(mainWindow, 'init')
    apiGetConf.start() // The answer will be catch then the process will close itself
  }
}

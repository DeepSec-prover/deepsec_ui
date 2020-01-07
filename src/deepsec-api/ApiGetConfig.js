import { ApiManager } from './ApiManager'
import userSettings from 'electron-settings'
import logger from 'electron-log'

/**
 * This manager is made to be used inside the main process.
 */
export class ApiGetConfig extends ApiManager {
  static namespace () { return 'get-config' }

  constructor (mainWindow, ipcId) {
    super(false, null, mainWindow, ipcId)
  }

  start (options) {
    return super.start({ command: 'get_config' })
  }

  registerAllAnswers () {
    this.addAnswerHandler('config', this.config)
  }

  config (answer) {
    this.pushNotification(`DeepSec API version ${answer.version} successfully detected`)
    logger.info(`DeepSec API detected with version: ${answer.version}`)
    logger.info(`Result directory path set to: ${answer.result_files_path}`)
    userSettings.set('resultsDirPath', answer.result_files_path)
  }

  /**
   * Override the event reply since it works only in the main process.
   * @param content The content of the reply.
   */
  eventReply (content) {
    /* Do nothing */
  }
}

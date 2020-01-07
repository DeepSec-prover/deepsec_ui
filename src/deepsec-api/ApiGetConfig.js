import { ApiManager } from './ApiManager'

export class ApiGetConfig extends ApiManager {
  static namespace () { return 'get-config' }

  constructor (event, mainWindow, ipcId) {
    super(false, event, mainWindow, ipcId)
  }

  start (options) {
    return super.start({ command: 'get_config' })
  }

  registerAllAnswers () {
    this.addAnswerHandler('config', this.config)
  }

  config (answer) {
    this.eventReply(
      {
        success: true,
        content: answer
      })
  }
}

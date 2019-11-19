import { ApiManager } from './ApiManager'

export class ApiDisplayTrace extends ApiManager {
  constructor () {
    super('display-trace', false)
  }

  registerAllAnswers () {
    this.addAnswerHandler('current_step', this.currentStep)
  }

  currentStep (answer) {
    this.eventReply({
                      success: true,
                      process: answer.process,
                      frame: answer.frame,
                      currentActionId: answer.current_action_id
                    })
  }
}

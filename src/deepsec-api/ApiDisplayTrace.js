import { ApiManager } from './ApiManager'

export class ApiDisplayTrace extends ApiManager {
  constructor (ipcId) {
    super('display-trace', false, ipcId)
  }

  registerAllAnswers () {
    this.addAnswerHandler('current_step', this.currentStep)
    this.addAnswerHandler('no_attack_trace', this.noAttackTrace)
  }

  registerAllQueries () {
    this.addQueryHandler('goto_step', this.gotoStep)
  }

  currentStep (answer) {
    this.eventReply({
                      success: true,
                      process: answer.process,
                      frame: answer.frame,
                      current_action_id: answer.current_action_id
                    })
  }

  noAttackTrace (_) {
    this.eventReply({
                      success: false,
                      error: 'No attack trace for this query.'
                    })
  }

  gotoStep (event, stepId) {
    this.sendCommand({ command: 'goto_step', id: stepId })
  }
}

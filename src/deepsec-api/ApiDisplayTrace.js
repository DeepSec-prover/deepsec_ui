import { ApiManager } from './ApiManager'

export class ApiDisplayTrace extends ApiManager {

  static namespace () { return 'display-trace' }

  constructor (event, mainWindow, ipcId) {
    super(false, event, mainWindow, ipcId)
  }

  registerAllAnswers () {
    this.addAnswerHandler('current_step', this.currentStep)
    this.addAnswerHandler('no_attack_trace', this.noAttackTrace)
  }

  registerAllQueries () {
    this.addQueryHandler('goto_step', this.gotoStep)
    this.addQueryHandler('die', this.die)
  }

  currentStep (answer) {
    this.eventReply({
                      success: true,
                      // Stringify necessary for big process, if not some bug occurs
                      // TODO reproduce the bug and report it
                      process: JSON.stringify(answer.process),
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

  die () {
    this.sendCommand({ command: 'die' })
  }
}

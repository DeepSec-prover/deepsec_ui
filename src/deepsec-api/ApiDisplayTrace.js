import { ApiManager } from './ApiManager'

export class ApiDisplayTrace extends ApiManager {
  static namespace () { return 'display-trace' }

  constructor (event, mainWindow, ipcId) {
    super(false, event, mainWindow, ipcId)
  }

  start (options) {
    options = {
      command: 'start_display_trace',
      query_file: options.query_file,
      id: options.id
    }

    return super.start(options)
  }

  registerAllAnswers () {
    this.addAnswerHandler('current_step_displayed', this.currentStepDisplayed)
    this.addAnswerHandler('no_attack_trace', this.noAttackTrace)
  }

  registerAllQueries () {
    this.addQueryHandler('goto_step', this.gotoStep)
    this.addQueryHandler('die', this.die)
  }

  // ==================== Answers ====================

  currentStepDisplayed (answer) {
    // Stringify necessary for big process, if not some bug occurs
    // TODO reproduce the bug and report it
    answer.process = JSON.stringify(answer.process)
    this.eventReply({
                      success: true,
                      content: answer
                    })
  }

  noAttackTrace (_) {
    this.eventReply({
                      success: false,
                      error: 'No attack trace for this query.'
                    })
  }

  // ==================== Queries ====================

  gotoStep (_, stepId, processId) {
    this.sendCommand({
                       command: 'goto_step',
                       id: stepId,
                       process_id: processId
                     })
  }

  die () {
    this.sendCommand({ command: 'die' })
  }
}

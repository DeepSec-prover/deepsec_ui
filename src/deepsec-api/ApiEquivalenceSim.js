import { ApiManager } from './ApiManager'

export class ApiEquivalenceSim extends ApiManager {
  static namespace () { return 'equivalence-simulator' }

  constructor (event, mainWindow, ipcId) {
    super(false, event, mainWindow, ipcId)
  }

  start (options) {
    options = {
      command: 'start_equivalence_simulator',
      query_file: options.query_file,
      process_id: options.process_id,
    }

    return super.start(options)
  }

  registerAllAnswers () {
    this.addAnswerHandler('current_step_user', this.currentStepUser)
    this.addAnswerHandler('current_step_displayed', this.currentStepDisplayed)
    this.addAnswerHandler('user_error', this.userError)
    this.addAnswerHandler('found_equivalent_trace', this.foundEquivalentTrace)
    // Error answer
    this.addAnswerHandler('init_error', this.initError)
  }

  registerAllQueries () {
    this.addQueryHandler('goto_step', this.gotoStep)
    this.addQueryHandler('next_step_user', this.nextStepUser)
    this.addQueryHandler('next_steps', this.nextSteps)
    this.addQueryHandler('reset_simulator', this.resetSimulator)
    this.addQueryHandler('find_equivalent_trace', this.findEquivalentTrace)
    this.addQueryHandler('die', this.die)
  }

  // ==================== Answers ====================

  currentStepUser (answer) {
    answer.process = JSON.stringify(answer.process)
    this.eventReply({
                      success: true,
                      content: answer
                    })
  }

  currentStepDisplayed (answer) {
    answer.process = JSON.stringify(answer.process)
    this.eventReply({
                      success: true,
                      content: answer
                    })
  }

  userError (answer) {
    this.eventReply({
                      success: false,
                      content: answer
                    })
  }

  foundEquivalentTrace (answer) {
    this.eventReply({
                      success: true,
                      content: answer
                    })
  }

  initError (answer) {
    this.pushNotification('Internal error',
                          `Please report this error.<br>Message: ${answer.error_msg}`,
                          'error')
    this.eventReply({ success: false, content: answer })
  }

  // ==================== Queries ====================

  gotoStep (_, stepId, processId) {
    this.sendCommand({
                       command: 'goto_step',
                       id: stepId,
                       process_id: processId
                     })
  }

  nextStepUser (_, action) {
    this.sendCommand({
                       command: 'next_step_user',
                       action: action
                     })
  }

  nextSteps (_, actions) {
    this.sendCommand({
                       command: 'next_steps',
                       actions: actions
                     })
  }

  resetSimulator (_, processId) {
    this.sendCommand({
                       command: 'reset_simulator',
                       process_id: processId
                     })
  }

  findEquivalentTrace () {
    this.sendCommand({ command: 'find_equivalent_trace' })
  }

  die () {
    this.sendCommand({ command: 'die' })
  }
}

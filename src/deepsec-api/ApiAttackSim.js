import { ApiManager } from './ApiManager'

export class ApiAttackSim extends ApiManager {
  static namespace () { return 'attack-simulator' }

  constructor (event, mainWindow, ipcId) {
    super(false, event, mainWindow, ipcId)
  }

  start (options) {
    options = {
      command: 'start_attack_simulator',
      query_file: options.query_file
    }

    return super.start(options)
  }

  registerAllAnswers () {
    this.addAnswerHandler('current_step_user', this.currentStepUser)
    this.addAnswerHandler('current_step_displayed', this.currentStepDisplayed)
  }

  registerAllQueries () {
    this.addQueryHandler('goto_step', this.gotoStep)
    this.addQueryHandler('next_step_user', this.nextStepUser)
    this.addQueryHandler('next_steps', this.nextSteps)
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

  die () {
    this.sendCommand({ command: 'die' })
  }
}

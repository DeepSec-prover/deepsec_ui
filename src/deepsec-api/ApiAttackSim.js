import { ApiManager } from './ApiManager'

export class ApiAttackSim extends ApiManager {

  static namespace () { return 'attack-simulator' }

  constructor (event, mainWindow, ipcId) {
    super(false, event, mainWindow, ipcId)
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
    this.eventReply({
                      success: true,
                      content: answer
                    })
  }

  currentStepDisplayed (answer) {
    this.eventReply({
                      success: true,
                      content: answer
                    })
  }

  // ==================== Queries ====================

  gotoStep (_, options) {
    this.sendCommand({
                       command: 'goto_step',
                       id: options.stepId,
                       process_id: options.processId
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

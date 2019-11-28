import { ApiManager } from './ApiManager'

export class ApiAttackSim extends ApiManager {

  static namespace () { return 'attack-simulator' }

  constructor (event, mainWindow, ipcId) {
    super(false, event, mainWindow, ipcId)
  }

  registerAllAnswers () {
    this.addAnswerHandler('current_step_simulated', this.currentStepSimulated)
    this.addAnswerHandler('current_step_attacked', this.currentStepAttacked)
  }

  registerAllQueries () {
    this.addQueryHandler('goto_step', this.gotoStep)
    this.addQueryHandler('next_step_simulated', this.nextStepSimulated)
    this.addQueryHandler('die', this.die)
  }

  // ==================== Answers ====================

  currentStepSimulated (answer) {
    this.eventReply({
                      success: true,
                      content: answer
                    })
  }

  currentStepAttacked (answer) {
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

  nextStepSimulated (_, action) {
    this.sendCommand({
                       command: 'next_step_simulated',
                       selected_action: action
                     })
  }

  die () {
    this.sendCommand({ command: 'die' })
  }
}

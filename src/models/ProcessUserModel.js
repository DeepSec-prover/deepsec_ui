import ProcessModel from './ProcessModel'

export default class ProcessUserModel extends ProcessModel {
  constructor (processId, process, atomicData, apiRemote) {
    super(processId, process, atomicData, [], apiRemote)

    this.availableActions = { default: [], all: [] }
    this.statusEquivalence = null
  }

  update (answer) {
    super.update(answer)
    this.availableActions = answer.available_actions
    this.statusEquivalence = answer.status_equiv
    this.actions.concat(answer.new_actions)
  }

  /**
   * Send a list of actions to execute in the current process state to the API.
   *
   * @param {Array} actions One or several actions.
   */
  simulateActions (actions) {
    this.loading = true

    // Wait for the next reply
    this.apiRemote.onReply(this.handleUpdateAnswer.bind(this))

    // Send query
    this.apiRemote.sendQuery('next_step_simulated', actions)
  }

  /**
   * Check if it's possible to go back in the use action history.
   *
   * @returns {boolean} True if it's possible to undo the last use action.
   */
  hasBackHistory () {
    return this.actions.length > 0
  }

  /**
   * Check if it's possible to go forward in the use action history.
   * Only possible if some actions has been undo previously.
   *
   * @returns {boolean} True if it's possible to redo an action.
   */
  hasNextHistory () {
    return false
  }

  /**
   * Undo the last action in the action history.
   */
  undo () {

  }

  /**
   * Redo the last undo action.
   */
  redo () {

  }

  nbVisibleAction () {
    let count = 0

    this.actions.forEach(a => {
      if (this.isVisibleAction(a, 'io')) {
        count++
      }
    })

    return count
  }
}

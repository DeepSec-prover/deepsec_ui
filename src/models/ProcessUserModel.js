import ProcessModel from './ProcessModel'

export default class ProcessUserModel extends ProcessModel {
  constructor (processId, process, atomicData, apiRemote) {
    super(processId, process, atomicData, [], apiRemote)

    this.availableActions = { default: [], all: [] }
    this.statusEquivalence = null

    this.actionsHistory = []
  }

  update (answer) {
    super.update(answer)
    this.availableActions = answer.available_actions
    this.statusEquivalence = answer.status_equiv
    this.actions.concat(answer.new_actions)
  }

  gotoAction (actionId, saveHistory = true) {
    this.loading = true

    // Remove actions from the list
    const removedAction = this.actions.slice(actionId + 1)

    if (saveHistory) {
      this.actionsHistory.concat(
        () => this.executeActions(removedAction, false)
      )
    }
    super.gotoAction(actionId)
  }

  /**
   * Send a list of actions to execute in the current process state to the API.
   *
   * @param {Array} actions One or several actions.
   * @param {boolean} saveHistory If true this action can be save in the history (for undo).
   */
  executeActions (actions, saveHistory = true) {
    this.loading = true

    if (saveHistory) {
      // Save reverse action
      this.actionsHistory.push(
        () => this.gotoAction(this.actions.length - 1, false)
      )
    }

    // Wait for the next reply
    this.apiRemote.onReply(this.handleUpdateAnswer.bind(this))

    // Send query
    this.apiRemote.sendQuery('next_steps', actions)
  }

  /**
   * Send the next action selected by the user from current available action.
   *
   * @param {Array} action One action selected by the user.
   * @param {boolean} saveHistory If true this action can be save in the history (for undo).
   */
  nextUserAction (action, saveHistory = true) {
    this.loading = true

    if (saveHistory) {
      // Save reverse action
      this.actionsHistory.push(
        () => this.gotoAction(this.actions.length - 1, false)
      )
    }

    // Wait for the next reply
    this.apiRemote.onReply(this.handleUpdateAnswer.bind(this))

    // Send query
    this.apiRemote.sendQuery('next_step_user', action)
  }

  /**
   * Check if it's possible to go back in the use action history.
   *
   * @returns {boolean} True if it's possible to undo the last use action.
   */
  hasBackHistory () {
    return this.actionsHistory.length > 0
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
    this.loading = true

    const reverseAction = this.actionsHistory.pop()
    reverseAction()
  }

  /**
   * Redo the last undo action.
   */
  redo () {

  }

  nbVisibleAction () {
    return this.actions.filter(a => ProcessModel.isVisibleAction(a, 'io')).length
  }
}
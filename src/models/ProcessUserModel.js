import ProcessModel from './ProcessModel'

export default class ProcessUserModel extends ProcessModel {
  constructor (processId, process, atomicData, apiRemote) {
    super(processId, process, atomicData, [], apiRemote)

    this.availableActions = { default: [], all: [] }
    this.statusEquivalence = null

    this.actionsHistory = []
    this.actionsRestore = []
  }

  update (answer) {
    super.update(answer)
    this.availableActions = answer.available_actions
    this.statusEquivalence = answer.status_equiv
    if (answer.new_actions && answer.new_actions.length > 0) {
      this.actions.push(...answer.new_actions)
    }
  }

  gotoAction (actionId, saveHistory = true) {
    this.loading = true

    // Remove actions from the list
    const removedActions = this.actions.splice(actionId + 1)

    if (saveHistory) {
      this.actionsHistory.push(
        () => this.executeActions(removedActions, false)
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
      const currentId = this.actions.length - 1
      // Save reverse action
      this.actionsHistory.push(
        () => this.gotoAction(currentId, false)
      )
    }

    // Send query
    this.apiRemote.sendQuery('next_steps', actions)

    // Add actions in the list
    this.actions.push(...actions)
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
      const currentId = this.actions.length - 1
      // Save reverse action
      this.actionsHistory.push(
        () => this.gotoAction(currentId, false)
      )
    }

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
    return this.actionsRestore.length > 0
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

  /**
   * @returns {Object[]} The list of available actions depending of the current trace level.
   */
  getCurrentAvailableActions () {
    return this.availableActions[this.traceLevel]
  }

  /**
   * Create a copy of a process model as a new user model and stop update the original one.
   * If the original process is already a user model just return it (no copy).
   *
   * @param {ProcessModel} processModel The original process to copy.
   * @param {Boolean} keepContext If true also copy the frame and the action list.
   */
  static convertToProcessUser (processModel, keepContext = false) {
    if (Object.getPrototypeOf(processModel) === ProcessUserModel.prototype) {
      if (!keepContext) {
        processModel.frame = []
        processModel.names = []
        processModel.actions = []
        // remove undo history
        processModel.actionsHistory = []
        processModel.actionsRestore = []
      }
      return processModel
    }

    // Remove update listener
    processModel.stopUpdate()

    const copy = new ProcessUserModel(processModel.processId,
                                      processModel.process,
                                      [],  // Copy the atomic renamer after
                                      processModel.apiRemote)

    copy.traceLevel = processModel.traceLevel
    copy.atomic = processModel.atomic

    if (keepContext) {
      copy.frame = processModel.frame
      copy.names = processModel.names
      copy.actions = processModel.actions
    }

    return copy
  }
}

import AtomicRenamer from '../util/AtomicRenamer'

export default class QueryTraceModel {
  /**
   * Create a new query trace model.
   *
   * @param {QueryModel} query The query to display the trace.
   * @throws Error if the query has no attack.
   */
  constructor (query) {
    if (!query.attackTrace) {
      throw new Error('Impossible to load the trace of a query with no attack.')
    }

    this.query = query
    this.frame = []
    this.currentAction = -1
    // Unique rename table for the all trace and process
    this.atomic = new AtomicRenamer(this.query.atomicData)
    // Just shortcuts
    this.actions = this.query.attackTrace.action_sequence
    this.process = this.query.getAttackedProcess()
  }

  /**
   * @returns {Number} The total number of step in this trace
   */
  nbSteps () {
    return this.actions.length
  }

  /**
   * Go to a specific action, load the process state and the frame from DeepSec API.
   *
   * @param {Number} id The id of the action
   */
  gotoAction (id) {
    // TODO go to action
    this.currentAction = id
  }

  /**
   * Go to the last action of this trace. Shortcut for gotoAction with the last id.
   * @see gotoAction
   */
  gotoFirstAction () {
    this.gotoAction(-1)
  }

  /**
   * Go to the initial state of this trace. Shortcut for gotoAction with the id -1.
   * @see gotoAction
   */
  gotoLastAction () {
    this.gotoAction(this.actions.length - 1)
  }

  /**
   * Check if there is any more action after the current one.
   *
   * @returns {boolean} True if there is at least one more action.
   */
  hasNextAction () {
    return this.currentAction < this.actions.length - 1;
  }

  /**
   * Check if there is any action before the current one.
   *
   * @returns {boolean} True if there is at least one action before.
   */
  hasPreviousAction () {
    return this.currentAction > -1
  }

  /**
   * Go to the next action depending of a detail level.
   * @see gotoAction
   *
   * @param {"default"|"io"|"all"} level The detail level
   */
  nextAction (level) {
    for (let i = this.currentAction + 1; i < this.nbSteps(); i++) {
      if (QueryTraceModel.isVisibleAction(this.actions[i], level)) {
        this.gotoAction(i)
        return
      }
    }

    // If nothing match go to the last one
    this.gotoLastAction()
  }

  /**
   * Go to the previous action depending of a detail level.
   * @see gotoAction
   *
   * @param {"default"|"io"|"all"} level The detail level
   */
  previousAction (level) {
    for (let i = this.currentAction - 1; i > -1; i--) {
      if (QueryTraceModel.isVisibleAction(this.actions[i], level)) {
        this.gotoAction(i)
        return
      }
    }

    // If nothing match go to the first one
    this.gotoFirstAction()
  }

  /**
   * Check if an action is visible depending of a detail level.
   *
   * @param {Object} action The action to check
   * @param {"default"|"io"|"all"} level The detail level
   * @returns {boolean} True if the action is visible on this detail level, false if this action
   * should be hidden.
   */
  static isVisibleAction (action, level) {
    switch (level) {
      case 'default':
        return action.type === 'output' || action.type === 'input' || action.type === 'eavesdrop'
          || action.type === 'bang'
      case 'io':
        return action.type === 'output' || action.type === 'input' || action.type === 'eavesdrop'
      case 'all':
        return true
      default:
        throw new Error(`Invalid filter level : ${level}`)
    }
  }
}

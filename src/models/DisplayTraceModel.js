import AtomicRenamer from '../util/AtomicRenamer'
import ApiRemote from '../deepsec-api/ApiRemote'
import logger from 'electron-log'

export default class DisplayTraceModel {
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
    this.apiRemote = new ApiRemote('display-trace', this.query.path, false)
    this.frame = []
    this.currentAction = -1
    // Unique rename table for the all trace and process
    this.atomic = new AtomicRenamer(this.query.atomicData)
    // Just shortcuts
    this.actions = this.query.attackTrace.action_sequence
    this.process = this.query.getAttackedProcess()
    this.loading = false
    this.running = false
  }

  /**
   * Go to a specific action, load the process state and the frame from DeepSec API.
   * Send the start call to the API if necessary.
   *
   * @param {Number} id The id of the action
   */
  gotoAction (id) {
    this.loading = true

    // Wait for the next reply
    this.apiRemote.onReply(this.updateFromResult.bind(this))

    if (this.running) {
      this.apiRemote.sendQuery('goto_step', id)
    } else {
      this.running = true
      // Send the fist display trace order
      this.apiRemote.start(
        {
          'command': 'start_display_trace',
          'query_file': this.query.path,
          'id': id
        })
    }
  }

  /**
   * Update model content from API answer.
   *
   * @param _ Useless event object.
   * @param {Object} result The result object from the API.
   */
  updateFromResult (_, result) {
    if (result.success) {
      logger.silly(`Received trace display ${result.current_action_id}`)
      this.currentAction = result.current_action_id
      this.frame = result.frame
      this.process = JSON.parse(result.process)
    } else {
      logger.error(`Display trace bad result : ${JSON.stringify(result)}`)
    }

    this.loading = false
  }

  /**
   * Ask to the process to stop.
   */
  stop () {
    if (this.running && this.apiRemote.started && !this.apiRemote.stopped) {
      this.apiRemote.sendQuery('die')
    }
    this.running = false
  }

  /**
   * @returns {Number} The total number of step in this trace
   */
  nbSteps () {
    return this.actions.length
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
    return this.currentAction < this.actions.length - 1
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
      if (DisplayTraceModel.isVisibleAction(this.actions[i], level)) {
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
      if (DisplayTraceModel.isVisibleAction(this.actions[i], level)) {
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

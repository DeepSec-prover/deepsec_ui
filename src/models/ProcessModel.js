import AtomicRenamer from '../util/AtomicRenamer'
import logger from 'electron-log'

export default class ProcessModel {
  /**
   * Create a new process model used for simulations.
   *
   * @param {number} processId The index of the process in the current query.
   * @param {Object} process The full process.
   * @param {Array} atomicData The table of atomic data of the process.
   * @param {Array} actions The list of know action for this process.
   * @param {Object} apiRemote The reference to the API remote.
   */
  constructor (processId, process, atomicData, actions, apiRemote) {
    this.processId = processId
    this.process = process
    this.atomic = new AtomicRenamer(atomicData)
    this.frame = []
    this.actions = actions
    this.apiRemote = apiRemote
    this.loading = false
    this.traceLevel = 'default'
  }

  /**
   * Send the first call to the API.
   *
   * @param {Object} options The command options.
   */
  startProcess (options) {
    this.loading = true

    // Wait for the next reply
    this.apiRemote.onReply(this.handleUpdateAnswer.bind(this))

    this.apiRemote.start(options)
  }

  /**
   * Go to a specific action, load the process state and the frame from DeepSec API.
   * Send the start call to the API if necessary.
   *
   * @param {number} actionId The id of the action.
   * @param {boolean} saveHistory If true this action can be save in the history (for undo).
   */
  gotoAction (actionId, saveHistory = true) {
    this.loading = true

    // Wait for the next reply
    this.apiRemote.onReply(this.handleUpdateAnswer.bind(this))

    // Send query
    this.apiRemote.sendQuery('goto_step', actionId, this.processId)
  }

  /**
   * Handle the update answer and switch loading status.
   *
   * @param _ Useless event.
   * @param {Object} answer The API answer.
   */
  handleUpdateAnswer (_, answer) {
    if (answer.content.process_id === this.processId) {
      if (answer.success) {
        logger.silly('Process update from API.')
        this.update(answer.content)
      } else {
        logger.error(`Process update failed : ${JSON.stringify(answer)}`)
      }
      this.loading = false
    }
  }

  /**
   * Update model data from the API answer.
   * Should be override.
   *
   * @param {Object} answer The API answer.
   */
  update (answer) {
    this.process = JSON.parse(answer.process)
    this.frame = answer.frame
  }

  /**
   * Check if an action is visible depending of the current detail level.
   *
   * @param {Object} action The action to check
   * @param {"default"|"io"|"all"} level The trace level
   * @returns {boolean} True if the action is visible with the current detail level, false if this
   * action should be hidden.
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

  /**
   * Count the number of visible action (I/O) in this process trace.
   *
   * @returns {number} The number of visible action.
   */
  nbVisibleAction () {
    throw new TypeError('Must override method')
  }
}

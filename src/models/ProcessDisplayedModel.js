import ProcessModel from './ProcessModel'

export default class ProcessDisplayedModel extends ProcessModel {
  constructor (processId, process, atomicData, actions, apiRemote) {
    super(processId, process, atomicData, actions, apiRemote)
    this.currentAction = -1
  }

  update (answer) {
    super.update(answer)
    this.currentAction = answer.current_action_id
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
   * @returns {Number} The total number of step in this trace
   */
  nbSteps () {
    return this.actions.length
  }

  /**
   * Go to the initial state of this trace. Shortcut for gotoAction with the id -1.
   * @see gotoAction
   */
  gotoFirstAction () {
    this.gotoAction(-1)
  }

  /**
   * Go to the last action of this trace. Shortcut for gotoAction with the last id.
   * @see gotoAction
   */
  gotoLastAction () {
    this.gotoAction(this.getLastActionId())
  }

  /**
   * Go to the next action depending of a detail level.
   * @see gotoAction
   */
  gotoNextAction () {
    this.gotoAction(this.getNextActionId())
  }

  /**
   * Go to the previous action depending of a detail level.
   * @see gotoAction
   */
  gotoPreviousAction () {
    for (let i = this.currentAction - 1; i > -1; i--) {
      if (ProcessModel.isVisibleAction(this.actions[i], this.traceLevel)) {
        this.gotoAction(i)
        return
      }
    }

    // If nothing match go to the first one
    this.gotoFirstAction()
  }

  /**
   * @returns {number} The last action id.
   */
  getLastActionId () {
    return this.actions.length - 1
  }

  /**
   * Get the next action id depending of a detail level.
   *
   * @returns {number} The next action id.
   */
  getNextActionId () {
    for (let i = this.currentAction + 1; i < this.nbSteps(); i++) {
      if (ProcessModel.isVisibleAction(this.actions[i], this.traceLevel)) {
        return i
      }
    }

    // If nothing match go to the last one
    return this.getLastActionId()
  }

  /**
   * Get the list of next actions position id.
   * Use for focus some part in the code.
   *
   * @returns {string[]} Next action position id formatted as a string.
   */
  getNextActionPositions () {
    const positions = []

    for (let i = this.currentAction + 1; i < this.nbSteps(); i++) {
      const a = this.actions[i]

      if (a.position) {
        positions.push(a.position)
      }
      if (a.input_position) {
        positions.push(a.input_position)
      }
      if (a.output_position) {
        positions.push(a.output_position)
      }

      if (ProcessModel.isVisibleAction(this.actions[i], this.traceLevel)) {
        break
      }
    }

    // Format to string and return
    return positions.map(p => ProcessModel.formatPositionToString(p))
  }

  /**
   * Got to a step that match with a specific number of visible actions (I/O).
   *
   * @param {number} nb The number of visible action we want.
   * @throws Error If it's impossible to reach this number of visible action.
   */
  gotoNbVisibleAction (nb) {
    if (nb === 0) {
      this.gotoFirstAction()
      return
    }

    let count = 0

    for (let i = 0; i < this.actions.length; i++) {
      if (ProcessModel.isVisibleAction(this.actions[i], 'io')) {
        count++
      }
      if (count === nb) {
        this.gotoAction(i)
        return
      }
    }

    throw new Error(`Fail to go the nb visible action ${nb}.`)
  }

  nbVisibleAction () {
    let count = 0

    for (let i = 0; i < this.actions.length; i++) {
      if (i > this.currentAction) {
        break
      }
      if (ProcessModel.isVisibleAction(this.actions[i], 'io')) {
        count++
      }
    }

    return count
  }

  /**
   * Get the n-th visible action.
   *
   * @returns {String|null} 'input', 'output' or 'eavesdrop'
   */
  getVisibleAction (n) {
    let count = 0

    for (let i = 0; i < this.actions.length; i++) {
      if (ProcessModel.isVisibleAction(this.actions[i], 'io')) {
        count++
      }
      if (count === n) {
        return this.actions[i]
      }
    }

    return null
  }

  /**
   * Create a copy of a process model as a new display model and stop update the original one.
   * If the original process is already a display model just return it (no copy).
   *
   * @param {ProcessModel} processModel The original process to copy.
   * @param {Boolean} keepContext If true also copy the frame and the current action.
   */
  static convertToProcessDisplay (processModel, keepContext = false) {
    if (Object.getPrototypeOf(processModel) === ProcessDisplayedModel.prototype) {
      if (!keepContext) {
        processModel.currentAction = -1
        processModel.frame = []
      }
      return processModel
    }

    // Remove update listener
    processModel.stopUpdate()

    const copy = new ProcessDisplayedModel(processModel.processId,
                                           processModel.process,
                                           [], // Copy the atomic renamer after
                                           processModel.actions,
                                           processModel.apiRemote)

    copy.traceLevel = processModel.traceLevel
    copy.atomic = processModel.atomic

    if (keepContext) {
      copy.currentAction = processModel.actions.length - 1
      copy.frame = processModel.frame
    }
    return copy
  }
}

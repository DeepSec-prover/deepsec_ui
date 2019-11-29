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
   * Go to the next action depending of a detail level.
   * @see gotoAction
   */
  gotoNextAction () {
    for (let i = this.currentAction + 1; i < this.nbSteps(); i++) {
      if (this.isVisibleAction(this.actions[i])) {
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
   */
  gotoPreviousAction () {
    for (let i = this.currentAction - 1; i > -1; i--) {
      if (this.isVisibleAction(this.actions[i])) {
        this.gotoAction(i)
        return
      }
    }

    // If nothing match go to the first one
    this.gotoFirstAction()
  }

  /**
   * Got to a step that match with a specific number of visible actions (I/O).
   *
   * @param {number} nb The number of visible action we want.
   * @throws Error If it's impossible to reach this number of visible action.
   */
  gotoNbVisibleAction (nb) {
    let count = 0

    for (let i = 0; i < this.actions.length; i++) {
      if (this.isVisibleAction(this.actions[i], 'io')) {
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
      if (this.isVisibleAction(this.actions[i], 'io')) {
        count++
      }
    }

    return count
  }
}

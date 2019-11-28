import ProcessModel from './ProcessModel'

export default class ProcessAttackedModel extends ProcessModel {
  constructor (process, atomicData, actions) {
    super(process, atomicData, actions)
    this.currentAction = -1
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
}

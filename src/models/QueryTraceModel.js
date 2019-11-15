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

  nbSteps () {
    return this.actions.length
  }

  gotoAction (id) {
    // TODO go to action
    this.currentAction = id
  }

  gotoFirstAction () {
    this.gotoAction(-1)
  }

  gotoLastAction () {
    this.gotoAction(this.actions.length - 1)
  }

  hasNextAction (level = 'all') {
    return this.currentAction < this.actions.length - 1;
  }

  hasPreviousAction (level = 'all') {
    return this.currentAction > -1
  }

  nextAction (level) {
    this.gotoAction(this.currentAction + 1)
  }

  previousAction (level) {
    this.gotoAction(this.currentAction - 1)
  }
}

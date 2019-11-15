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
    for (let i = this.currentAction + 1; i < this.nbSteps(); i++) {
      if (QueryTraceModel.filterAction(this.actions[i], level)) {
        this.gotoAction(i)
        return
      }
    }

    this.gotoLastAction()
  }

  previousAction (level) {
    for (let i = this.currentAction - 1; i > -1; i--) {
      if (QueryTraceModel.filterAction(this.actions[i], level)) {
        this.gotoAction(i)
        return
      }
    }

    this.gotoFirstAction()
  }

  static filterAction (action, level) {
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

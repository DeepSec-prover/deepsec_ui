import ProcessModel from './ProcessModel'

export default class ProcessSimulatedModel extends ProcessModel {
  constructor (process, atomicData, actions) {
    super(process, atomicData, [])
  }

  canCancelHistory () {
    return true
  }

  canRestoreHistory () {
    return false
  }
}

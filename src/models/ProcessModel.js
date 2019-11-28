import AtomicRenamer from '../util/AtomicRenamer'

export default class ProcessModel {
  constructor (process, atomicData, actions, apiRemote) {
    this.process = process
    this.atomic = new AtomicRenamer(atomicData)
    this.frame = []
    this.actions = actions
    this.apiRemote = apiRemote
    this.loading = false
  }
}

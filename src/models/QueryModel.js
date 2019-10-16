import loadResultFile from '../util/results-files'

export default class QueryModel {
  constructor (resultFile) {
    this.path = resultFile
    // Load result file as json
    let json = loadResultFile(resultFile)

    // Mandatory fields
    this.status = json.status
    this.batchFile = json.batch_file
    this.runFile = json.run_file
    this.atomicData = json.atomic_data
    this.semantics = json.semantics
    this.type = json.type
    this.process = json.process

    // Optional fields
    if (json.start_time) {
      this.startTime = new Date(json.start_time * 1000)
    } else {
      this.startTime = null
    }

    if (json.end_time) {
      this.endTime = new Date(json.end_time * 1000)
    } else {
      this.endTime = null
    }

    if (json.error_msg) {
      this.errorMsg = json.error_msg
    } else {
      this.errorMsg = null
    }

    if (json.attack_trace) {
      this.attackTrace = json.attack_trace
    } else {
      this.attackTrace = null
    }
  }
}

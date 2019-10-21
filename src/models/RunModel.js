import ResultModel from './ResultModel'
import BatchModel from './BatchModel'
import QueryModel from './QueryModel'
import path from 'path'

export default class RunModel extends ResultModel {
  mapJsonFile (json) {
    this.status = json.status
    this.inputFile = json.input_file

    this.batch = null // Not loaded yet
    this.batchFile = json.batch_file

    this.queries = null // Not loaded yet
    this.queryFiles = json.query_files

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

    if (json.warnings) {
      this.warnings = json.warnings
    } else {
      this.warnings = null
    }

    if (json.error_msg) {
      this.errorMsg = json.error_msg
    } else {
      this.errorMsg = null
    }
  }

  loadRelations () {
    this.batch = new BatchModel(this.batchFile, false)
    this.queries = this.queryFiles.map(queryFile =>
      new QueryModel(queryFile, false))
  }

  title () {
    return this.inputFileName ().replace(/\.dps$/ui, '')
  }

  inputFileName () {
    return path.basename(this.inputFile)
  }

  nbQueries () {
    return this.queryFiles.length
  }
}

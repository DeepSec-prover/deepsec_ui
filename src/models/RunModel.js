import userSettings from 'electron-settings'
import ResultModel from './ResultModel'
import BatchModel from './BatchModel'
import QueryModel from './QueryModel'
import path from 'path'

export default class RunModel extends ResultModel {
  mapJsonFile (json) {
    // Load generic field with parent method
    super.mapJsonFile(json)

    this.inputFile = json.input_file
    this.batchFile = json.batch_file
    this.queryFiles = json.query_files

    // Optional fields
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

  loadQueries () {
    this.queries = this.queryFiles.map(queryFile =>
                                         new QueryModel(queryFile, false))
  }

  loadBatch () {
    this.batch = new BatchModel(this.batchFile, false)
  }

  title () {
    return this.inputFileName().replace(/\.dps$/ui, '')
  }

  getIpcId () {
    return this.batchFile
  }

  progressionPercent () {
    if (this.isCompleted()) {
      return 100
    }

    if (this.status === 'waiting') {
      return 0
    }

    const queriesProgression = this.queries.reduce(
      (sum, q) => sum + q.absoluteProgressionPercent(), 0)

    return Math.floor(queriesProgression / this.nbQueries())
  }

  inputFileName () {
    return path.basename(this.inputFile)
  }

  nbQueries () {
    return this.queryFiles.length
  }

  nbQueriesCompleted () {
    return this.queries.filter(q => q.isCompleted()).length
  }

  /**
   * @returns {String} Input (spec) file absolute paths
   */
  inputFileAbsolutePath () {
    return path.join(userSettings.get('resultsDirPath'), this.inputFile)
  }
}

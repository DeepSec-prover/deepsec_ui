import ResultModel from './ResultModel'
import RunModel from './RunModel'
import RunConfigModel from './RunConfigModel'
import { isEmptyOrBlankStr } from '../util/misc'

export default class BatchModel extends ResultModel {
  mapJsonFile (json) {
    // Load generic field with parent method
    super.mapJsonFile(json)

    this.deepsecVersion = json.deepsec_version
    this.gitBranch = json.git_branch
    this.gitHash = json.git_hash
    this.ocamlVersion = json.ocaml_version

    this.debug = json.debug === true || json.debug === 1 // Boolean are stored as int in the database
    this.pid = json.pid

    if (json.command_options) {
      this.commandOptions = RunConfigModel.loadFromJson(json.command_options)
    }
    if (json.computed_options) {
      this.computedOptions = RunConfigModel.loadFromJson(json.computed_options)
    }

    this.runFiles = json.run_files

    if (this.isDbPreview) {
      this.nbRun = json.nb_run
    } else {
      this.nbRun = this.runFiles ? this.runFiles.length : 0
    }

    if (!isEmptyOrBlankStr(json.title)) {
      this.defaultTitle = json.title
    } else {
      this.defaultTitle = null
    }

    if (json.import_date) {
      // In result files the dates are in seconds
      if (!this.isDbPreview) {
        json.import_date = json.import_date * 1000
      }
      this.importTime = new Date(json.import_date * 1000)
    } else {
      this.importTime = null
    }

    if (json.error_msg) {
      this.errorMsg = json.error_msg
    } else {
      this.errorMsg = null
    }

    // List of all runs' queries
    this.runsQueries = []
  }

  loadRelations () {
    this.runs = this.runFiles.map(file => new RunModel(file, false))
  }

  /**
   * Load all runs of this batch and their queries.
   */
  loadRelationsDeep () {
    this.runs = this.runFiles.map(file => new RunModel(file, true))
  }

  /**
   * Link all queries from all run of this batch.
   * Used to be sure they are observable.
   */
  linkQueries () {
    this.runs.forEach(r => {
      r.queries.forEach(q => this.runsQueries.push(q))
    })
  }

  /**
   * Get the maximum memory used by OCaml during the running time of this batch.
   *
   * @returns {Number} The maximum memory in Byte.
   */
  maxMemoryUsed () {
    return this.runs.reduce(
      (sum, r) => Math.max(sum, r.maxMemoryUsed()), 0)
  }

  title () {
    if (this.defaultTitle !== null) {
      return this.defaultTitle
    }

    // If no title use current date
    return this.startTime.toLocaleDateString() + ' ' + this.startTime.toLocaleTimeString()
  }

  getIpcId () {
    return this.path
  }

  progressionPercent () {
    if (this.isCompleted()) {
      return 100
    }

    if (this.status === 'waiting') {
      return 0
    }

    const runsProgression = this.runs.reduce((sum, r) => sum + r.progressionPercent(), 0)

    return Math.floor(runsProgression / this.nbRun)
  }

  nbRunCompleted () {
    return this.runs.filter(r => r.isCompleted()).length
  }

  runIndex (run) {
    return this.runFiles.indexOf(run.path) + 1
  }

  localId () {
    return this.path.replace(/\.json$/ui, '')
  }

  /**
   * @returns {Array} All input (spec) files absolute paths
   */
  inputFilesAbsolutePaths () {
    return this.runs.map(r => r.inputFileAbsolutePath())
  }

  runsStatusCount () {
    const status = []
    status.in_progress = 0
    status.waiting = 0
    status.completed = 0
    status.canceled = 0
    status.internal_error = 0

    this.runs.forEach(run => status[run.status]++)

    return status
  }
}

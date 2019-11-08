import ResultModel from './ResultModel'
import RunModel from './RunModel'
import RunConfigModel from './RunConfigModel'
import { isEmptyOrBlankStr } from '../util/misc'

export default class BatchModel extends ResultModel {
  mapJsonFile (json) {
    this.deepsecVersion = json.deepsec_version
    this.gitBranch = json.git_branch
    this.gitHash = json.git_hash
    this.ocamlVersion = json.ocaml_version

    this.debug = json.debug
    this.commandOptions = RunConfigModel.loadFromJson(json.command_options)
    this.computedOptions = RunConfigModel.loadFromJson(json.computed_options)

    this.runs = null // Not loaded yet
    this.runFiles = json.run_files

    if (!isEmptyOrBlankStr(json.title)) {
      this.defaultTitle = json.title
    } else {
      this.defaultTitle = null
    }

    if (json.import_date) {
      this.importTime = new Date(json.import_date * 1000)
    } else {
      this.importTime = null
    }

    if (json.error_msg) {
      this.errorMsg = json.error_msg
    } else {
      this.errorMsg = null
    }
  }

  loadRelations () {
    this.runs = this.runFiles.map(file => new RunModel(file, false))
  }

  title () {
    if (this.defaultTitle !== null) {
      return this.defaultTitle
    }

    // If no title use current date
    return this.startTime.toLocaleDateString() + ' ' + this.startTime.toLocaleTimeString()
  }

  progressionPercent () {
    if (this.isCompleted()) {
      return 100
    }

    if (this.status === 'waiting') {
      return 0
    }

    const runsProgression = this.runs.reduce((sum, r) => sum + r.progressionPercent(), 0)

    return Math.floor(runsProgression / this.nbRun())
  }

  nbRun () {
    return this.runFiles.length
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
  inputFilesAbsolutePaths() {
    return this.runs.map(r => r.inputFileAbsolutePath())
  }

  runsStatusCount () {
    let status = []
    status['in_progress'] = 0
    status['waiting'] = 0
    status['completed'] = 0
    status['canceled'] = 0
    status['internal_error'] = 0

    this.runs.forEach(run => status[run.status]++)

    return status
  }
}

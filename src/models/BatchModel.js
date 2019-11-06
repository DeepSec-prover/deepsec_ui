import ResultModel from './ResultModel'
import RunModel from './RunModel'
import RunConfigModel from './RunConfigModel'

export default class BatchModel extends ResultModel {
  mapJsonFile (json) {
    this.deepsecVersion = json.deepsec_version
    this.gitBranch = json.git_branch
    this.gitHash = json.git_hash
    this.commandOptions = RunConfigModel.loadFromJson(json.command_options)
    this.computedOptions = RunConfigModel.loadFromJson(json.computed_options)

    this.runs = null // Not loaded yet
    this.runFiles = json.run_files

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
    return this.startTime.toLocaleDateString() + ' ' + this.startTime.toLocaleTimeString()
  }

  nbRun () {
    return this.runFiles.length
  }

  runIndex (run) {
    return this.runFiles.indexOf(run.path) + 1
  }

  localId () {
    return this.path.replace(/\.json$/ui, '')
  }

  specFiles () {
    return this.runs.map(r => r.inputFile)
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

import { isEmptyOrBlankStr } from '../util/misc'

export default class RunConfigModel {
  constructor () {
    this.defaultSemantic = 'private'
    this.distributed = 'auto'
    this.nbJobs = { auto: true, value: 200 }
    this.localWorkers = { auto: true, value: 2 }
    this.roundTimer = 120
    this.por = true // show in the ui only if false
    this.servers = []
    this.title = ''

    // To give an id to every server
    this.serversId = 0
  }

  /**
   * Add a server with default value
   */
  addServer () {
    this.servers.push(new RunConfigServerModel(++this.serversId))
  }

  /**
   * Remove a server.
   *
   * @param {Object} server The server reference to remove
   */
  removeServer (server) {
    const index = this.servers.indexOf(server)
    this.servers.splice(index, 1)
  }

  /**
   * @returns {number} The number of server
   */
  nbServer () {
    return this.servers.length
  }

  nbDistantWorkers () {
    let sum = 0

    for (let i = 0; i < this.servers.length; i++) {
      if (this.servers[i].workers.auto) {
        return 'auto'
      }
      sum += this.servers[i].workers.value
    }

    return sum
  }

  /**
   * Clean user inputs (eg: trim, multiple spaces ...)
   */
  preProcessData () {
    if (this.title) {
      this.title = this.title.trim().replace(/\s+/, ' ')
    }
    this.servers.forEach(s => {
      s.host = s.host.trim()
      s.path = s.path.trim()
    })
  }

  /**
   * Setup the data before restarting a run
   */
  beforeRestart () {
    if (this.distributed === false) {
      this.nbJobs = { auto: true, value: 200 }
      this.localWorkers = { auto: true, value: 2 }
      this.roundTimer = 120
    };
    return this
  }

  /**
   * Convert to a json object usable for DeepSec API command.
   *
   * @returns {Object} The json object
   */
  toJson () {
    const json = {
      default_semantics: this.defaultSemantic,
      distributed: this.distributed,
      por: this.por
    }

    if (!isEmptyOrBlankStr(this.title)) {
      json.title = this.title
    }

    if (this.distributed === true) {
      json.nb_jobs = this.nbJobs.auto ? 'auto' : this.nbJobs.value
      json.local_workers = this.localWorkers.auto ? 'auto' : this.localWorkers.value
      json.round_timer = this.roundTimer
      json.distant_workers = this.servers.map(s => {
        return {
          host: s.host,
          path: s.path,
          workers: s.workers.auto ? 'auto' : s.workers.value
        }
      })
    }

    return json
  }

  /**
   * Load a run config from json object.
   *
   * @param {Object} json The json object which contains the config information
   * @returns {RunConfigModel} The run config model
   */
  static loadFromJson (json) {
    const config = new RunConfigModel()
    config.defaultSemantic = json.default_semantics
    config.distributed = json.distributed
    config.por = json.por
    config.title = json.title
    config.roundTimer = json.round_timer

    if (json.nb_jobs !== null && json.nb_jobs !== undefined) {
      config.nbJobs.auto = json.nb_jobs === 'auto'
      if (!config.nbJobs.auto) {
        config.nbJobs.value = json.nb_jobs
      }
    } else {
      config.nbJobs = undefined
    }

    if (json.local_workers !== null && json.local_workers !== undefined) {
      config.localWorkers.auto = json.local_workers === 'auto'
      if (!config.localWorkers.auto) {
        config.localWorkers.value = json.local_workers
      }
    } else {
      config.localWorkers = undefined
    }

    if (json.distant_workers !== null && json.distant_workers !== undefined) {
      config.servers = json.distant_workers.map(s => {
        return RunConfigServerModel.loadFromJson(s, ++config.serversId)
      })
    } else {
      config.servers = []
    }

    return config
  }
}

class RunConfigServerModel {
  constructor (id) {
    this.id = id
    this.host = ''
    this.path = ''
    this.workers = { auto: true, value: 10 }
  }

  static loadFromJson (json, id) {
    const server = new RunConfigServerModel(id)
    server.host = json.host
    server.path = json.path

    if (json.workers) {
      server.workers.auto = json.workers === 'auto'
      if (!server.workers.auto) {
        server.workers.value = json.workers
      }
    }

    return server
  }
}

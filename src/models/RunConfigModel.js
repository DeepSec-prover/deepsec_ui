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
    let index = this.servers.indexOf(server)
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
   * @returns {string} The printable distributed value
   */
  distributedStr () {
    if (this.distributed === 'auto') {
      return 'auto'
    }

    if (this.distributed === true) {
      return 'yes'
    }

    return 'no'
  }

  /**
   * @returns {string} The printable nb jobs value
   */
  nbJobsStr () {
    if (this.nbJobs.auto) {
      return 'auto'
    }

    return this.nbJobs.value.toString()
  }

  /**
   * @returns {string} The printable nb workers value
   */
  localWorkersStr () {
    if (this.localWorkers.auto) {
      return 'auto'
    }

    return this.localWorkers.value.toString()
  }

  /**
   * @returns {string} The printable POR value
   */
  porStr () {
    return this.por ? 'yes' : 'no'
  }

  /**
   * Clean user inputs (eg: trim, multiple spaces ...)
   */
  preProcessData () {
    this.title = this.title.trim().replace(/\s+/, " ")
    this.servers.forEach(s => {
      s.host = s.host.trim()
      s.path = s.path.trim()
    })
  }

  /**
   * Convert to a json object usable for DeepSec API command.
   *
   * @returns {Object} The json object
   */
  toJson () {
    let json = {
      'default_semantics': this.defaultSemantic,
      'distributed': this.distributed,
      'por': this.por
    }

    if (!isEmptyOrBlankStr(this.title)) {
      json['title'] = this.title
    }

    if (this.distributed === true) {
      json['nb_jobs'] = this.nbJobs.auto ? 'auto' : this.nbJobs.value
      json['local_workers'] = this.localWorkers.auto ? 'auto' : this.localWorkers.value
      json['round_timer'] = this.roundTimer
      json['distant_workers'] = this.servers.map(s => {
        return {
          'host': s.host,
          'path': s.path,
          'workers': s.workers.auto ? 'auto' : s.workers.value
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
    let config = new RunConfigModel()
    config.defaultSemantic = json.default_semantics
    config.distributed = json.distributed
    config.por = json.por

    if (json.title) {
      config.title = json.title
    }

    if (json.nb_jobs) {
      config.nbJobs.auto = json.nb_jobs === 'auto'
      if (!config.nbJobs.auto) {
        config.nbJobs.value = json.nb_jobs
      }
    }

    if (json.local_workers) {
      config.localWorkers.auto = json.local_workers === 'auto'
      if (!config.localWorkers.auto) {
        config.localWorkers.value = json.local_workers
      }
    }

    if (json.round_timer) {
      config.roundTimer = json.round_timer
    }

    if (json.distant_workers) {
      config.servers = json.distant_workers.map(s => {
        return RunConfigServerModel.loadFromJson(s, ++config.serversId)
      })
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

  /**
   * @returns {string} The printable workers value
   */
  workersStr () {
    if (this.workers.auto) {
      return 'auto'
    }

    return this.workers.value.toString()
  }

  static loadFromJson (json, id) {
    let server = new RunConfigServerModel(id)
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

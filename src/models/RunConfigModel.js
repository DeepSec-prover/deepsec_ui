export default class RunConfigModel {
  constructor () {
    this.defaultSemantic = 'private'
    this.distributed = 'auto'
    this.nbJobs = { auto: true, value: 200 }
    this.localWorkers = { auto: true, value: 2 }
    this.roundTimer = 120
    this.por = true // show in the ui only if false
    this.servers = []

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

  /**
   * Convert to a json object usable for DeepSec API command.
   *
   * @returns {Object} The json object
   */
  toJson () {
    let json = {
      'default_semantics': this.defaultSemantic,
      'distributed': this.distributed
    }

    if (this.distributed === 'yes') {
      json['nb_jobs'] = this.nbJobs.auto ? 'auto' : this.nbJobs.value
      json['local_workers'] = this.localWorkers.auto ? 'auto' : this.localWorkers.value
      json['distant_workers'] = this.servers.map(s => {
        return {
          'host': s.host,
          'path': s.path,
          'workers': s.workers.auto ? 'auto' : s.workers.value
        }
      })
      json['round_timer'] = this.roundTimer
    }

    return json
  }
}

class RunConfigServerModel {
  constructor (id) {
    this.id = id
    this.host = ''
    this.path = ''
    this.workers = { auto: true, value: 10 }
  }
}

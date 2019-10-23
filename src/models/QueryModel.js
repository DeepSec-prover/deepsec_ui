import ResultModel from './ResultModel'
import BatchModel from './BatchModel'
import RunModel from './RunModel'
import text from '../text-content/text'

export default class QueryModel extends ResultModel {
  mapJsonFile (json) {
    // Mandatory fields
    this.status = json.status
    this.index = json.index
    this.atomicData = json.atomic_data.data
    this.semantics = json.semantics
    this.type = json.type
    this.processes = json.processes

    this.batch = null // Not loaded yet
    this.batchFile = json.batch_file

    this.run = null // Not loaded yet
    this.runFile = json.run_file

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

  loadRelations (json) {
    this.batch = new BatchModel(this.batchFile, false)
    this.run = new RunModel(this.runFile, false)
  }

  title () {
    return this.index.toString()
  }

  /**
   * Check if the query is over and an attack has been found
   *
   * @returns {boolean} True if an attack is found, false if not
   */
  attackFound () {
    return this.attackTrace !== null
  }

  /**
   * Return a human readable description for this query result.
   * See text dictionary file for description mapping.
   *
   * @param {boolean} short If true return the short description, else return the full description
   * @returns {String} The result description
   */
  resultDescription (short = false) {
    let description
    if (this.attackFound()) {
      if (short) {
        description = text.query.results.attack[this.type].short
      } else {
        description = text.query.results.attack[this.type].long
      }

      description = description.replace('%p', this.attackTrace.index_process).
        replace('%q', (this.attackTrace.index_process % 2) + 1)
    } else {
      if (short) {
        description = text.query.results.no_attack[this.type].short
      } else {
        description = text.query.results.no_attack[this.type].long
      }
    }

    return description
  }

  /**
   * Alias for resultDescription(true)
   *
   * @returns {String} The short result description
   */
  shortResultDescription () {
    return this.resultDescription(true)
  }

  /**
   * Alias for resultDescription(false)
   *
   * @returns {String} The long result description
   */
  longResultDescription () {
    return this.resultDescription(false)
  }
}

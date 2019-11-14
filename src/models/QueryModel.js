import ResultModel from './ResultModel'
import BatchModel from './BatchModel'
import RunModel from './RunModel'
import text from '../text-content/text'

export default class QueryModel extends ResultModel {
  mapJsonFile (json) {
    // Mandatory fields
    this.index = json.index
    this.atomicData = json.atomic_data.data
    this.semantics = json.semantics
    this.type = json.type
    this.processes = json.processes

    this.batch = null // Not loaded yet
    this.batchFile = json.batch_file

    this.run = null // Not loaded yet
    this.runFile = json.run_file

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

    this.progression = json.progression
  }

  loadRelations () {
    this.batch = new BatchModel(this.batchFile, false)
    this.run = new RunModel(this.runFile, false)
  }

  loadRun () {
    this.run = new RunModel(this.runFile, false)
  }

  title () {
    return this.index.toString()
  }

  progressionPercent () {
    if (this.status === 'completed') {
      return 100
    }

    if (!this.progression) {
      return 0
    }

    if (this.progression.generation) {
      return Math.floor(this.progression.generation.jobs_created /
                          this.progression.generation.minimum_jobs)
    }

    if (this.progression.verification) {
      return this.progression.verification.percent
    }
  }

  /**
   * Progression estimation for the all query processing
   */
  absoluteProgressionPercent () {
    const GENERATION_WEIGHT = 0.1
    const VERIF_WEIGHT = 0.9

    if (this.status === 'completed') {
      return 100
    }

    if (!this.progression) {
      return 0
    }

    if (this.progression.generation) {
      return Math.floor(this.progression.generation.jobs_created /
                          this.progression.generation.minimum_jobs * GENERATION_WEIGHT)
    }

    if (this.progression.verification) {
      return Math.floor((this.progression.verification.percent * VERIF_WEIGHT) +
                          (100 * GENERATION_WEIGHT))
    }
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
   * @returns {null|Object} The process where the attack trace was found. Null if no attack
   */
  getAttackedProcess () {
    if (!this.attackFound()) {
      return null
    }

    return this.processes[this.attackTrace.index_process]
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

      description = description.replace('%p', this.attackTrace.index_process)
                               .replace('%q', (this.attackTrace.index_process % 2) + 1)
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

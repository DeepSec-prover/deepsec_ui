import { isDir, isEmptyOrBlankStr, isFile } from '../util/misc'
import logger from 'electron-log'
import path from 'path'
import fs from 'fs'
import defaultValues  from '../util/default-values'



import ApiRemote from '../deepsec-api/ApiRemote'

/**
 * @type {number} Number of retry when opening an empty file
 */
const MAX_RETRY = 3

/**
 * Abstract class to load result models
 */
export default class ResultModel {
  /**
   * Load a result from a json file and map fields in the model.
   *
   * @param {String|Object} filePathOrRow The path to the json file to load or the database row (see flag isDbPreview)
   * @param {Boolean} loadRelations If true load related result (batch, run, queries ...)
   * @param {Boolean} updateListener If true wait for updates from IPC signal, will be ignored if
   * status is not waiting or in progress
   * @param {Boolean} isDbPreview If true the first parameter should be a database row for this result
   */
  constructor (filePathOrRow, loadRelations = false, updateListener = false, isDbPreview = false) {
    this.isDbPreview = isDbPreview
    this.apiRemote = null

    let json
    if (isDbPreview) {
      this.path = filePathOrRow.path + '.json'
      json = filePathOrRow
    } else {
      this.path = filePathOrRow
      // Mapping specific for each result type
      json = ResultModel.loadResultFile(this.path)
    }

    this.mapJsonFile(json)

    if (loadRelations) {
      this.loadRelations()
    }

    if (updateListener) {
      this.enableUpdateListener()
    }
  }

  /**
   * Enable the update listener for this result. Will reload data from file whenever a change
   * is notified by the IPC signal.
   * This method do nothing if the listener has been set before or if the status can't change.
   */
  enableUpdateListener () {
    // Set update listener if never set before and status could change
    if (!this.updateListener && this.isActive()) {
      logger.info(`Start to listen update for result : ${this.path}`)
      this.updateListener = true
      this.apiRemote = new ApiRemote('start-run', this.getIpcId(), true)
      this.updateTrigger()
    }
  }

  /**
   * Check if the result status is completed
   *
   * @returns {boolean} True if the current status is competed, False if any other status
   */
  isCompleted () {
    return this.status === 'completed'
  }

  /**
   * Check if the result status match with an active one (in_progress or waiting).
   * Is active if the status is not final and can change.
   *
   * @returns {boolean} True if is active, False if not.
   */
  isActive () {
    return this.status === 'in_progress' || this.status === 'waiting'
  }

  /**
   * Map the result json file to this model fields.
   */
  mapJsonFile (json) {
    this.status = json.status

    // Optional fields
    if (json.start_time) {
      // In result files the dates are in seconds
      if (!this.isDbPreview) {
        json.start_time = json.start_time * 1000
      }
      this.startTime = new Date(json.start_time)
    } else {
      this.startTime = null
    }

    if (json.end_time) {
      // In result files the dates are in seconds
      if (!this.isDbPreview) {
        json.end_time = json.end_time * 1000
      }
      this.endTime = new Date(json.end_time)
    } else {
      this.endTime = null
    }
  }

  /**
   * Load the related results.
   * Current model should be full loaded first.
   */
  loadRelations () {
    throw new TypeError('Must override method')
  }

  /**
   * @return {String} Current result name as human readable string
   */
  title () {
    throw new TypeError('Must override method')
  }

  /**
   * @return {Number} The current progression, integer between 0-100
   */
  progressionPercent () {
    throw new TypeError('Must override method')
  }

  /**
   * Get the result IPC id for update. Should be the batch result path.
   * @See ../deepsec-api/ApiStartRun.js
   * @return {String} The IPC id.
   */
  getIpcId () {
    throw new TypeError('Must override method')
  }

  /**
   * Register what signals to catch and what action to do.
   */
  updateTrigger () {
    this.apiRemote.onSignal('update', (_, content) => {
      if (this.path === content.file) {
        logger.silly(`Update result : ${this.path}`)
        const json = ResultModel.loadResultFile(this.path)
        this.mapJsonFile(json)
      }
    }, false)
  }

  /**
   * Load a result file as a JSON object
   *
   * @param {String} relativePath The path to the result file relative to the result directory
   * @returns {Object} A json object
   * @throws Error If any problem with the file
   */
  static loadResultFile (relativePath) {
    const dirPath = defaultValues['resultsDirPath']
    if (isEmptyOrBlankStr(dirPath)) {
      logger.error('Result directory not set')
      throw Error('Result directory not set')
    }

    if (!isDir(dirPath)) {
      logger.error(`Result directory path is not valid : ${dirPath}`)
      throw Error(`Result directory path is not valid : ${dirPath}`)
    }

    const filePath = path.join(dirPath, relativePath)

    if (!isFile(filePath)) {
      logger.error(`Result file path is not valid : ${filePath}`)
      throw Error(`Result file path is not valid : ${filePath}`)
    }

    let rawContent = ''
    let success = false
    let nbTry = 0

    // If the result file is empty try several times because it could open the file exactly when
    // the file is being written. This should be very rare.
    do {
      nbTry++
      rawContent = fs.readFileSync(filePath)
      logger.debug(`Result file loaded : ${filePath}`)

      success = !isEmptyOrBlankStr(rawContent.toString())
      if (!success) {
        logger.error(
          `Result file empty "${filePath}" but content expected. Can be ignored if occurs very rarely.
          Retry ${nbTry}/${MAX_RETRY}`)
      }
    } while (!success && nbTry <= MAX_RETRY)

    if (!success) {
      logger.error(`Fail to open "${filePath}" after maximal retry (${MAX_RETRY}), still empty.`)
      throw Error(`Fail to open "${filePath}" after maximal retry (${MAX_RETRY}), still empty.`)
    }

    try {
      return JSON.parse(rawContent)
    } catch (e) {
      logger.error(
        `Fail to parse result file "${filePath}" with content : ${rawContent.toString()}`, e)
      throw e
    }
  }
}

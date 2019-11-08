import userSettings from 'electron-settings'
import { isDir, isEmptyOrBlankStr, isFile } from '../util/misc'
import logger from 'electron-log'
import path from 'path'
import fs from 'fs'

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
   * @param {string} resultFilePath The path to the json file to load
   * @param {Boolean} loadRelations If true load related result (batch, run, queries ...)
   */
  constructor (resultFilePath, loadRelations = false) {
    this.path = resultFilePath

    let json = ResultModel.loadResultFile(resultFilePath)
    this.status = json.status

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

    // Mapping specific for each result type
    this.mapJsonFile(json)

    if (loadRelations) {
      this.loadRelations()
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
   * Map the result json file to this model fields.
   *
   * @param json
   */
  mapJsonFile (json) {
    throw new TypeError('Must override method')
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
   * Load a result file as a JSON object
   *
   * @param {String} relativePath The path to the result file relative to the result directory
   * @returns {Object} A json object
   * @throws Error If any problem with the file
   */
  static loadResultFile (relativePath) {
    let dirPath = userSettings.get('resultsDirPath').toString()

    if (isEmptyOrBlankStr(dirPath)) {
      logger.error('Result directory not set')
      throw Error('Result directory not set')
    }

    if (!isDir(dirPath)) {
      logger.error(`Result directory path is not valid : ${dirPath}`)
      throw Error(`Result directory path is not valid : ${dirPath}`)
    }

    let filePath = path.join(dirPath, relativePath)

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

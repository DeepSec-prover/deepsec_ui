import userSettings from 'electron-settings'
import { isDir, isEmptyOrBlankStr, isFile } from '../util/misc'
import logger from 'electron-log'
import path from 'path'
import fs from 'fs'

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
    this.mapJsonFile(json)

    if (loadRelations) {
      this.loadRelations()
    }
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
   * Load a result file as a JSON object
   *
   * @param {String} relativePath The path to the result file relative to the result directory
   * @returns {JSON} A json object
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

    let rawContent = fs.readFileSync(filePath)
    logger.debug(`Result file loaded : ${filePath}`)
    return JSON.parse(rawContent)
  }
}

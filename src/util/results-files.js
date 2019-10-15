import userSettings from 'electron-settings'
import { isDir, isEmptyOrBlankStr, isFile } from './misc'
import logger from 'electron-log'
import path from 'path'
import fs from 'fs'

/**
 * Load a result file as a JSON object
 *
 * @param {string} relativePath The path to the result file relative to the result directory
 * @returns {JSON} A json object
 */
export default function loadResultFile (relativePath) {
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

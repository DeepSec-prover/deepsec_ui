import logger from 'electron-log'
import fs from 'fs'

/**
 * Open a file and parse the content as Json.
 *
 * @param {string} filePath The local path to the file
 * @returns {Object|null} The JSON object or null if error during file reading or JSON parsing
 */
function openJsonFile (filePath) {
  logger.info(`Opening a file: ${filePath}`)

  let raw = ''
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch (e) {
    logger.error(`Fail to load the file ${filePath} : ${e}`)
    return null
  }

  let result = ''
  try {
    result = JSON.parse(raw)
  } catch (e) {
    logger.error(`Bad Json formatting in the file ${filePath}`)
    return null
  }

  return result
}

export default openJsonFile

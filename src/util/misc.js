import fs from 'fs'

/**
 * Check if a path is a file.
 * If the path doesn't exist return false.
 *
 * @param {string} path The path to check
 * @returns {boolean} True if the path is a file, false if not
 */
function isFile (path) {
  try {
    const stat = fs.lstatSync(path)
    return stat.isFile()
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false
  }
}

/**
 * Check if a path is a directory.
 * If the path doesn't exist return false.
 *
 * @param {string} path The path to check
 * @returns {boolean} True if the path is a directory, false if not
 */
function isDir (path) {
  try {
    const stat = fs.lstatSync(path)
    return stat.isDirectory()
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false
  }
}

/**
 * Check if a string is empty or contains only blank characters.
 * Undefined or null are considered as empty.
 *
 * @param {string} str The string to test
 * @returns {boolean} True is the string is defined and contains at least one non-blank character,
 * False if not
 */
function isEmptyOrBlankStr (str) {
  return !str || str.trim().length === 0
}

export { isDir, isFile, isEmptyOrBlankStr }

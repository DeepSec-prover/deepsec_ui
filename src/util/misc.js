import fs from 'fs'

/**
 * Check if a path is a file or a symbolic link.
 * If the path doesn't exist return false.
 *
 * @param {string} path The path to check
 * @returns {boolean} True if the path is a file, false if not
 */
function isFile (path) {
  try {
    const stat = fs.lstatSync(path)
    return stat.isFile() || stat.isSymbolicLink()
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

/**
 * appendEmptyLines(str,n) appends n blank line to str.
 *
 * @param {String} str The string on which the blank lines are appended.
 * @param {Number} n The number of lines to append.
 * @returns {String}
 */
function appendEmptyLines (str, n) {
  if (n === 0) {
    return str
  } else {
    return appendEmptyLines(str + '\n', n - 1)
  }
}

/**
 * Performs difference operation between two sets.
 * Because Javascript does't have a fu*king build-in function for this.
 *
 * @param {Set} set1 The first set.
 * @param {Set} set2 The set to subtract to the first one
 * @return {Set} set1 - set2
 */
function setDifference (set1, set2) {
  // creating new set to store difference
  const diff = new Set()

  // iterate over the values
  for (const elem of set1) {
    if (!set2.has(elem)) {
      diff.add(elem)
    }
  }

  return diff
}

export { isDir, isFile, isEmptyOrBlankStr, appendEmptyLines, setDifference }

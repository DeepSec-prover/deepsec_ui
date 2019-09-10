const RENAME_TABLE = new Map()

/**
 * Simplify an index by using smallest index value (>=0).
 * Return the name matching with the label and index if existing or create a new one.
 *
 * @param {string} label The name or variable name
 * @param {number} index The index
 * @returns {string} The name with smallest index
 */
function rename (label, index) {
  // Existing label
  if (RENAME_TABLE.has(label)) {
    // Existing label and index
    if (RENAME_TABLE.get(label).has(index)) {
      const newId = RENAME_TABLE.get(label).get(index)
      // Hide "0"
      if (newId === 0) {
        return label
      } else {
        return label + '~' + newId
      }
    }
    // Existing label but new index
    else {
      const labelTable = RENAME_TABLE.get(label)
      const newId = labelTable.size
      labelTable.set(index, newId)
      return label + '~' + newId
    }
  }
  // New label in the table
  else {
    RENAME_TABLE.set(label, new Map([[index, 0]]))
    return label // Hide "0"
  }
}

module.exports = rename

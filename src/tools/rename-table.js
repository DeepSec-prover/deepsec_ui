const RENAME_TABLE = new Map()

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
        return label + '_' + newId
      }
    }
    // Existing label but new index
    else {
      const labelTable = RENAME_TABLE.get(label)
      const newId = labelTable.size
      labelTable.set(index, newId)
      return label + '_' + newId
    }
  }
  // New label in the table
  else {
    RENAME_TABLE.set(label, new Map([[index, 0]]))
    return label // Hide "0"
  }
}

module.exports = rename

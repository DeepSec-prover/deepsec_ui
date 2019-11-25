/**
 * Store atomic data and renames names and variables when duplicate detected.
 */
export default class AtomicRenamer {
  /**
   * Create a new atomic renamer with a new renaming map.
   *
   * @param {Array} data The atomic table array
   */
  constructor (data) {
    this.dataTable = data
    this.renameTable = new Map()
  }

  /**
   * Get an atomic data from its position in the data table.
   *
   * @param {number} id The position in the atomic data array
   * @returns {Object}
   */
  get (id) {
    return this.dataTable[id]
  }

  /**
   * Get an atomic data from its position in the data table and rename it if necessary
   * Simplify an index by using smallest index value (>=0).
   * Return the name matching with the label and index if existing or create a new one.
   *
   * @param {number} id The position in the atomic data array
   * @returns {string} The name with smallest index
   */
  getAndRename (id) {
    const type = this.dataTable[id].type

    if (type !== 'Name' && type !== 'Variable') {
      throw Error(`Unexpected Atomic type ${type} to rename`)
    }

    const label = this.dataTable[id].label
    const index = this.dataTable[id].index
    const bang = this.dataTable[id].bang

    let bangStr = ''
    if (bang) {
      bangStr = '~' + bang.join('-')
    }

    // Existing label
    if (this.renameTable.has(label)) {
      // Existing label and index
      if (this.renameTable.get(label).has(index)) {
        const newId = this.renameTable.get(label).get(index)
        // Hide "0"
        if (newId === 0) {
          return label
        } else {
          return label + '_' + (newId + 1) + bangStr
        }
      }
      // Existing label but new index
      else {
        const labelTable = this.renameTable.get(label)
        const newId = labelTable.size
        labelTable.set(index, newId)
        return label + '_' + (newId + 1) + bangStr
      }
    }
    // New label in the table
    else {
      this.renameTable.set(label, new Map([[index, 0]]))
      return label + bangStr // Hide "0"
    }
  }
}

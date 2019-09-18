import rename from './rename-table'
import logger from 'electron-log'

/**
 * String for one code indent
 * @type {string}
 */
const INDENT = '   '

/**
 * Format a process from a Json format to a readable string
 *
 * @param {Object} process - The structured process
 * @param {Array} atomicTable - The table of atomic data
 * @returns {string} A readable string which describe the process
 * @see doc/process_structure.md for process structure
 */
function formatProcess (process, atomicTable) {
  logger.debug('[Start] Parsing a process')
  // Start recursive formatting
  const res = format(process, atomicTable, 0)
  logger.debug('[Done] Parsing a process')
  return res
}

/**
 * Select the correct formatting function and indent lines
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function format (subProcess, atomicTable, indent) {
  const linePrefix = strIndent(indent)

  switch (subProcess.type) {
    case 'Atomic':
      return formatAtomic(subProcess, atomicTable, indent)
    case 'Function':
      return formatFunction(subProcess, atomicTable, indent)
    case 'Equality':
      return formatEquality(subProcess, atomicTable, indent)
    case 'New':
      return linePrefix + formatNew(subProcess, atomicTable, indent)
    case 'LetInElse':
      return linePrefix + formatLetInElse(subProcess, atomicTable, indent)
    case 'Output':
      return linePrefix + formatOutput(subProcess, atomicTable, indent)
    case 'Par':
      return linePrefix + formatPar(subProcess, atomicTable, indent)
    case 'Input':
      return linePrefix + formatInput(subProcess, atomicTable, indent)
    case 'IfThenElse':
      return linePrefix + formatIfThenElse(subProcess, atomicTable, indent)
    case null:
      return linePrefix + '0\n'
    default:
      // Do not stop the app but log an error
      logger.error(`Try to parse an unknown sub-process type ${subProcess.type}`)
      return `------------ not implemented : ${subProcess.type} ------------`
  }
}

/**
 * Shortcut to create the indentation string
 *
 * @param {number} count - The number of indent
 * @returns {string} The full indentation string
 */
function strIndent (count) {
  return INDENT.repeat((count))
}

/* ============================================================================
   ============================== Format By Type ==============================
   ============================================================================ */

/**
 *  Format "New" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatNew (subProcess, atomicTable, indent) {
  return `new ${atomicTable[subProcess.name].label};\n` +
    format(subProcess.process, atomicTable, indent)
}

/**
 *  Format "LetInElse" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatLetInElse (subProcess, atomicTable, indent) {
  let res = 'let ' + format(subProcess.pattern, atomicTable, indent) + ' = ' +
    format(subProcess.term, atomicTable, indent) + ' in \n'

  // No "else" so no indent "in"
  if (subProcess.process_else.type === null) {
    res += format(subProcess.process_then, atomicTable, indent)
  }
  // With "else" so no indent all
  else {
    res += format(subProcess.process_then, atomicTable, indent + 1)
    res += strIndent(indent) + 'else\n' +
      format(subProcess.process_else, atomicTable, indent + 1)
  }

  return res
}

/**
 *  Format "Atomic" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatAtomic (subProcess, atomicTable, indent) {
  // Fetch subProcess in the atomic table
  subProcess = atomicTable[subProcess.id]

  if (subProcess.type === 'Name' || subProcess.type === 'Variable') {
    return rename(subProcess.label, subProcess.index)
  }

  throw Error(`Unexpected type ${subProcess.type}`)
}

/**
 *  Format "Function" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatFunction (subProcess, atomicTable, indent) {
  const symbol = atomicTable[subProcess.symbol]

  if (symbol.category === 'Tuple') {
    return '⟨' + subProcess.args.map(value => format(value, atomicTable, indent)).join(',') + '⟩'
  } else {
    let res = symbol.label

    res += '(' + subProcess.args.map(value => format(value, atomicTable, indent)).join(',') + ')'

    return res
  }
}

/**
 *  Format "Output" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatOutput (subProcess, atomicTable, indent) {
  let res = 'out(' + format(subProcess.channel, atomicTable, indent) + ',' +
    format(subProcess.term, atomicTable, indent) + ')'

  if (subProcess.process.type === null) {
    res += '\n'
  } else {
    res += ';\n' + format(subProcess.process, atomicTable, indent)
  }

  return res
}

/**
 *  Format "Par" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatPar (subProcess, atomicTable, indent) {
  return '(\n' + subProcess.process_list.map(process => {
    return format(process, atomicTable, indent + 1)
  }).join(strIndent(indent) + ')|(\n') + strIndent(indent) + ')\n'
}

/**
 *  Format "Input" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatInput (subProcess, atomicTable, indent) {
  let res = 'in(' + format(subProcess.channel, atomicTable, indent) + ',' +
    format(subProcess.pattern, atomicTable, indent) + ')'

  if (subProcess.process.type === null) {
    res += '\n'
  } else {
    res += ';\n' + format(subProcess.process, atomicTable, indent)
  }

  return res
}

/**
 *  Format "IfThenElse" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatIfThenElse (subProcess, atomicTable, indent) {
  let res = 'if ' + format(subProcess.term1, atomicTable, indent) + ' = ' +
    format(subProcess.term2, atomicTable, indent) + ' then\n'

  // No "else" so no indent "then"
  if (subProcess.process_else.type === null) {
    res += format(subProcess.process_then, atomicTable, indent)
  }
  // With "else" so indent all
  else {
    res += format(subProcess.process_then, atomicTable, indent + 1) +
      strIndent(indent) + 'else\n' +
      format(subProcess.process_else, atomicTable, indent + 1)
  }

  return res
}

/**
 *  Format "Equality" type to readable string
 *
 * @param {Object} subProcess - A structured sub-process
 * @param {Array} atomicTable - The table of atomic data
 * @param {number} indent - The number of indentation character for the current sub-process (>1)
 * @returns {string} A readable string which describe the sub-process and its children
 */
function formatEquality (subProcess, atomicTable, indent) {
  return '=' + format(subProcess.term, atomicTable, indent)
}

export default formatProcess

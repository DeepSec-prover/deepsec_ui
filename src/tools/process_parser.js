const INDENT = '   '

function formatProcess (processJson) {

  const atomicTable = processJson.atomic_data
  const process = processJson.process1

  return format(process, atomicTable, 0)
}

function strIndent (count) {
  return INDENT.repeat((count))
}

function formatNew (content, atomicTable, indent) {
  return 'new ' + atomicTable[content.name].label + ';\n' +
    // Next line
    format(content.process, atomicTable, indent)
}

function formatLetInElse (content, atomicTable, indent) {
  return 'let ' + format(content.pattern, atomicTable, indent) + ' = ' +
    format(content.term, atomicTable, indent) + ' in \n' +
    // Next line
    format(content.process_then, atomicTable, indent)
  // TODO process_else
}

function formatAtomic (content, atomicTable, indent) {
  return atomicTable[content.id].label
}

function formatFunction (content, atomicTable, indent) {
  let res = atomicTable[content.symbol].label

  // TODO not () for empty args?
  if (content.args.length > 0) {
    res += content.args.map(value => format(value, atomicTable, indent)).join(',') + ')'
  }

  return res
}

function formatOutput (content, atomicTable, indent) {
  return 'out(' + format(content.channel, atomicTable, indent) + ',' +
    format(content.term, atomicTable, indent) + ');\n' +
    // New line
    format(content.process, atomicTable, indent)
}

function formatPar (content, atomicTable, indent) {
  return '(\n' + content.process_list.map(process => {
    return format(process, atomicTable, indent + 1)
  }).join(strIndent(indent) + ')|(\n') + strIndent(indent) + ')\n'
}

function formatInput (content, atomicTable, indent) {
  return 'in(' + format(content.channel, atomicTable, indent) + ',' +
    format(content.pattern, atomicTable, indent) + ');\n' +
    // New line
    format(content.process, atomicTable, indent)
}

function formatIfThenElse (content, atomicTable, indent) {
  // TODO always '=' ?
  let res = 'if ' + format(content.term1, atomicTable, indent) + ' = ' +
    format(content.term2, atomicTable, indent) + ' then\n' +
    format(content.process_then, atomicTable, indent + 1)

  if (content.process_else !== null) {
    res += strIndent(indent) + 'else\n' +
      format(content.process_else, atomicTable, indent + 1)
  }

  return res
}

function format (content, atomicTable, indent) {

  let linePrefix = strIndent(indent)

  switch (content.type) {
    case 'Atomic':
      // TODO specific format for each atomic
      return formatAtomic(content, atomicTable, indent)
    case 'Function':
      return formatFunction(content, atomicTable, indent)
    case 'New':
      return linePrefix + formatNew(content, atomicTable, indent)
    case 'LetInElse':
      return linePrefix + formatLetInElse(content, atomicTable, indent)
    case 'Output':
      return linePrefix + formatOutput(content, atomicTable, indent)
    case 'Par':
      return linePrefix + formatPar(content, atomicTable, indent)
    case 'Input':
      return linePrefix + formatInput(content, atomicTable, indent)
    case 'IfThenElse':
      return linePrefix + formatIfThenElse(content, atomicTable, indent)
    case null:
      return ''
    default:
      return '------------not implemented : ' + content.type
    // throw 'Not supported type ' + type TODO turn on exception

  }
}

module.exports = formatProcess

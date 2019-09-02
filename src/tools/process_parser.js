function formatProcess (processJson) {

  const atomicTable = processJson.atomic_data
  const process = processJson.process1

  return format(process, atomicTable)
}

function formatNew (content, atomicTable) {
  return 'new ' + atomicTable[content.name].label + ';\n' +
    // Next line
    format(content.process, atomicTable)
}

function formatLetInElse (content, atomicTable) {
  return 'let ' + format(content.pattern, atomicTable) + ' = ' +
    format(content.term, atomicTable) + ' in \n' +
    // Next line
    format(content.process_then, atomicTable)
  // TODO process_else
}

function formatAtomic (content, atomicTable) {
  return atomicTable[content.id].label
}

function formatFunction (content, atomicTable) {
  // TODO not () for empty args?
  return atomicTable[content.symbol].label + '(' +
    content.args.map(value => format(value, atomicTable)).join(',') + ')'
}

function formatOutput (content, atomicTable) {
  return 'out(' + format(content.channel, atomicTable) + ',' +
    format(content.term, atomicTable) + ');\n' +
    // New line
    format(content.process, atomicTable)
}

function formatPar (content, atomicTable) {
  return '(\n' + content.process_list.map(process => {
    return format(process, atomicTable)
  }).join(')|(\n') + ')\n'
}

function formatInput (content, atomicTable) {
  return 'in(' + format(content.channel, atomicTable) + ',' +
    format(content.pattern, atomicTable) + ');\n' +
    // New line
    format(content.process, atomicTable)
}

function formatIfThenElse (content, atomicTable) {
  // TODO always '=' ?
  let res = 'if ' + format(content.term1, atomicTable) + ' = ' +
    format(content.term2, atomicTable) + ' then\n' +
    format(content.process_then, atomicTable)

  if (content.process_else !== null) {
    res += 'else\n' + format(content.process_else, atomicTable)
  }

  return res
}

function format (content, atomicTable) {
  switch (content.type) {
    case 'Atomic':
      return formatAtomic(content, atomicTable)
    case 'New':
      return formatNew(content, atomicTable)
    case 'Function':
      return formatFunction(content, atomicTable)
    case 'LetInElse':
      return formatLetInElse(content, atomicTable)
    case 'Output':
      return formatOutput(content, atomicTable)
    case 'Par':
      return formatPar(content, atomicTable)
    case 'Input':
      return formatInput(content, atomicTable)
    case 'IfThenElse':
      return formatIfThenElse(content, atomicTable)
    case null:
      return ''
    default:
      return '------------not implemented : ' + content.type
    // throw 'Not supported type ' + type TODO turn on exception

  }
}

module.exports = formatProcess

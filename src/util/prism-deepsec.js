import Prism from 'prismjs'

const filters = {
  position: {
    pattern: /%(\d+(-\d+)*(-\w+)?)%(.|\n)+?%\/\1%/, // Something like "%142%...%/142%" or "%752-1-2%...%/752-1-2%"
    inside: {
      // Used to avoid infinite loop, see https://github.com/PrismJS/prism/issues/2133
      'position-content': {
        pattern: /(?<=%(\d+(-\d+)*(-\w+)?)%)(.|\n)+?(?=%\/\1%)/
        // Set inside later
      }
    }
  },
  comment: /\/\/.*(?=$|\n)/,
  'in-out': /(?<=\b)(in|out|eavesdrop)(?=\()/,
  keyword: {
    pattern: /(?<=\b)(new|let|if|then|else|in)(?=\b)|(?<=\s|%)->(?=\s|%)|(?<=^|\s|;|%)!~\d+/,
    inside: {
      sup: /~\d+/
    }
  },
  operator: /=\|\+/,
  function: {
    pattern: /(?<=^|[\s,;()%])(#?\w+|proj_{\d+,\d+})(?=\()/,
    inside: {
      sub: /(?<=\w)_\d+(?=\b)/
    }
  },
  punctuation: /[(),;]/,
  sup: /(?<=\w|')~\d+(-\d+)*(?=\s|$|_|%)/,
  sub: /(?<=\w|')_\d+(?=\b|~|%)/
}

// Recursive definition for position
filters.position.inside['position-content'].inside = filters

// Define the language grammar
Prism.languages.deepsec = filters

// Create hook before rendering code
Prism.hooks.add('wrap', env => {
  if (env.type === 'sub') {
    // Add <sub> tag
    env.content = env.content.replace('_', '')
  } else if (env.type === 'sup') {
    // Add <sup> tag
    env.content = env.content.replace('~', '')
  } else if (env.type === 'position') {
    // Position tag
    const index = env.content.match(/^%([-\d]+(?:\w+)?)%/)[1]
    env.classes.push(`position-${index}`)
    env.content = env.content.match(/^%[-\d]+(?:\w+)?%((.|\n)+?)%\/[-\d]+(?:\w+)?%$/)[1]
  } else if (env.type === 'function' && env.content.startsWith('proj_{')) {
    // Format projection function
    const n = Array.from(env.content.matchAll(/\d+/g))
    env.content = `\u03A0<span class="token sub">${n[0]},${n[1]}</span>`
  }
})

export default Prism

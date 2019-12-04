import Prism from 'prismjs'

// Define the language grammar
Prism.languages.deepsec = {
  keyword: {
    pattern: /(?<=\b)(new|let|if|then|else|in)(?=\s)|(?<=\s)->(?=\s)|(?<=^|\s|;)!~\d+/,
    inside: {
      sup: /~\d+/
    }
  },
  'in-out': /(?<=\b)(in|out|eavesdrop)(?=\()/,
  operator: /=\|/,
  function: {
    pattern: /(?<=^|[\s,;()])(#?\w+|proj_{\d+,\d+})(?=\()/,
    inside: {
      sub: /(?<=\w)_\d+(?=\b)/
    }
  },
  'no-args': /\(\)/,
  punctuation: /[(),;]/u,
  sup: /(?<=\w)~\d+(-\d+)*(?=\s|$|_)/,
  sub: /(?<=\w)_\d+(?=\b|~)/
}

// Create hook before rendering code
Prism.hooks.add('wrap', env => {
  // Add <sub> tag
  if (env.type === 'sub') {
    env.tag = 'sub'
    env.content = env.content.replace('_', '')
  }
  // Add <sup> tag
  else if (env.type === 'sup') {
    env.tag = 'sup'
    env.content = env.content.replace('~', '')
  }
  // Hide no args "()"
  else if (env.type === 'no-args') {
    env.classes.push('hidden')
  }
  // Format projection function
  else if (env.type === 'function' && env.content.startsWith('proj_{')) {
    const n = Array.from(env.content.matchAll(/\d+/g))
    env.content = `\u03A0<sub>${n[0]},${n[1]}</sub>`
  }
})

export default Prism

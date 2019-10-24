import Prism from 'prismjs'

// Define the language grammar
Prism.languages.deepsec = {
  keyword: {
    pattern: /(?<=^|\s)(new|let|if|then|else)(?=\s)|(?<=\s)->(?=\s)|(?<=^|\s)!~\d/,
    inside: {
      sup: /~\d+/
    }
  },
  'in-out': /(?<=^|\s)(in|out|eavesdrop)(?=\()/,
  operator: /=\|/,
  function: {
    pattern: /#?\w+(?=\()/,
    inside: {
      sub: /(?<=\w)_\d+(?=$|\s)/
    }
  },
  'no-args': /\(\)/,
  punctuation: /[()\u27e8\u27e9,;]/u, // TODO highlight for ⟨...⟩
  sup: /(?<=\w)~\d+(?=$|\s)/,
  sub: /(?<=\w)_\d+(?=$|\s)/
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
})

export default Prism

// Define the language grammar
Prism.languages['deepsec'] = {
  'keyword': /new|let|in|if|then|else|out/,
  'operator': /=\|/,
  'function': /\w+(?=\()/,
  'no-args': /\(\)/,
  'punctuation': /[()\u27e8\u27e9,;]/u,
  'sub': /(?=\w+)_\w+/
}

// Create hook before rendering code
Prism.hooks.add('wrap', env => {
  // Add <sub> tag
  if (env.type === 'sub') {
    env.tag = 'sub'
    env.content = env.content.replace('_', '')
  }

  // Hide no args "()"
  if (env.type === 'no-args') {
    env.classes.push('hidden')
  }
})

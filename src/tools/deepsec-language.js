// Define the language grammar
Prism.languages['deepsec'] = {
  'keyword': /new|let|in|if|then|else|out/,
  'operator': /=\|/,
  'punctuation': /[()\u27e8\u27e9,;]/u,
  'sub': /(?=\w+)_\w+/
}

// Create hook for to add <sub> tag
Prism.hooks.add('wrap', function (env) {
  if (env.type === 'sub') {
    env.tag = 'sub'
    env.content = env.content.replace('_', '')
  }
})

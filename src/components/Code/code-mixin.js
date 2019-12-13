import logger from 'electron-log'

const mixin = {
  props: {
    code: {
      type: String,
      required: true
    }
  },
  methods: {
    /**
     * Parse and highlight the code with Prism.
     * This add color and improve the syntax.
     */
    render () {
      if (this.code === '') {
        logger.silly('Update Prism code highlight')
        this.$refs.code.textContent = '// empty'
        Prism.highlightElement(this.$refs.code)
      } else if (this.code !== null) {
        logger.silly('Update Prism code highlight')
        // We have to edit directly the dom to enable Prism plugins
        this.$refs.code.textContent = this.code
        Prism.highlightElement(this.$refs.code)
      } else {
        // No code yet
        this.$refs.code.textContent = 'loading ...'
      }
    },
  },
  mounted () {
    this.render()
  }
}

export default mixin

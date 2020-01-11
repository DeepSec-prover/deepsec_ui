import logger from 'electron-log'
import userSettings from 'electron-settings'
import { isEmptyOrBlankStr } from '../../util/misc'
import { appendEmptyLines } from '../../util/misc'

const mixin = {
  props: {
    code: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      /**
       * The current code style theme chosen by the user
       */
      codeTheme: 'coy',
      /**
       * The minimun number of lines that should be displayed.
       */
      minimumNbLines: 0
    }
  },
  methods: {
    /**
     * Compute the code by adding blank line if this.code is
     * has a small number of line than this.minimumNbLines.
     */
    codeWithMinimumNbLines () {
      if (this.minimumNbLines === 0) {
        return this.code
      } else {
        const lines = this.code.match(/\n/g)
        let nblines = 0
        if (lines) {
          nblines = lines.length
        }
        if (nblines <= this.minimumNbLines) {
          return appendEmptyLines(this.code,(this.minimumNbLines - nblines))
        } else {
          return this.code
        }
      }
    },
    /**
     * Parse and highlight the code with Prism.
     * This add color and improve the syntax.
     */
    render () {
      if (isEmptyOrBlankStr(this.code)) {
        logger.verbose('Update Prism code highlight')
        this.$refs.code.textContent = '// empty'
        Prism.highlightElement(this.$refs.code)
      } else if (this.code !== null) {
        logger.verbose('Update Prism code highlight')
        // We have to edit directly the dom to enable Prism plugins
        this.$refs.code.textContent = this.codeWithMinimumNbLines ()
        Prism.highlightElement(this.$refs.code)
      } else {
        // No code yet
        this.$refs.code.textContent = 'loading ...'
      }
    }
  },
  beforeMount () {
    this.codeTheme = userSettings.get('codeStyleTheme', 'coy')
  },
  mounted () {
    this.render()
  }
}

export default mixin

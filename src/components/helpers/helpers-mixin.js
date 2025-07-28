import helpers from '../../text-content/helpers'
import defaultValues  from '../../util/default-values'


const mixin = {
  props: {
    helperId: {
      type: String,
      default: null
    },
    helperStr: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      helper: {
        openDelay: 400, // ms
        effect: 'light',
        placement: 'top',
        disable: !defaultValues.showHelpers,
      }
    }
  },
  computed: {
    /**
     * Fetch the helper text from the id.
     *
     * @return {String|null} A list of content string
     * @see ../text-content/helpers
     */
    helperContent: function () {
      const content = []

      // Fixed content
      if (this.helperStr !== null) {
        content.push(this.helperStr)
      }

      // Content from helper file
      if (this.helperId) {
        let helperContent = helpers
        const idParts = this.helperId.split('.')

        try {
          for (const part in idParts) {
            helperContent = helperContent[idParts[part]]
          }
        } catch (e) {
          console.error(`Can't find the id "${this.helperId}" in the helpers file`)
          return null
        }

        if (typeof helperContent === 'string' || helperContent instanceof String) {
          content.push(helperContent)
        } else {
          console.error(`Can't find the id "${this.helperId}" in the helpers file`)
          return null
        }
      }

      return content.join('<br>')
    }
  }
}

export default mixin

import helpers from '../../text-content/helpers'
import logger from 'electron-log'
import userSettings from 'electron-settings'

const mixin = {
  props: {
    helperId: {
      type: String
    }
  },
  data () {
    return {
      helper: {
        openDelay: 400, // ms
        effect: 'light',
        placement: 'top',
        disable: !userSettings.get('showHelpers', true)
      }
    }
  },
  methods: {
    /**
     * Fetch the helper text from the id.
     *
     * @param {String} id The unique id of the helper as object attribute ("path.to.string")
     * @return {String|null} The content of the helper
     * @see ../text-content/helpers
     */
    helperContent (id) {
      let idParts = id.split('.')
      let content = helpers

      for (let part in idParts) {
        content = content[idParts[part]]
      }

      if (typeof content === 'string' || content instanceof String) {
        return content
      } else {
        logger.error(`Can't find the id "${id}" in the helpers file`)
        return null
      }
    }
  }
}

export default mixin

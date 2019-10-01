<template>
  <el-form-item>
    <!-- Label with helper tooltip -->
    <template v-slot:label>
      <el-tooltip :content="helperContent(helperId)"
                  :placement="helper.placement"
                  :effect="helper.effect"
                  :open-delay="helper.openDelay">
        <span class="label-helper">{{ label }}</span>
      </el-tooltip> :
    </template>
    <!-- Input field -->
    <slot></slot>
  </el-form-item>
</template>

<script>
  import helpers from '../text-content/helpers'
  import logger from 'electron-log'

  export default {
    name: 'form-item-helper',
    props: {
      label: {
        type: String
      },
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
</script>

<style scoped>
  .label-helper {
    cursor: help;
  }
</style>

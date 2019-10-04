<template>
  <el-form-item :label="label">
    <!-- Integer -->
    <el-input-number v-if="Number.isInteger(value)"
                     v-model="value"
                     controls-position="right"></el-input-number>
    <!-- Boolean -->
    <el-switch v-else-if="typeof value === 'boolean'"
               v-model="value"></el-switch>
    <!-- String -->
    <el-input v-else v-model="value"></el-input>
  </el-form-item>
</template>

<script>
  import userSettings from 'electron-settings'
  import logger from 'electron-log'

  export default {
    name: 'setting-item',
    props: {
      label: String,
      settingsPath: String
    },
    data () {
      return {
        value: null
      }
    },
    mounted () {
      this.value = userSettings.get(this.settingsPath)

      // Set watcher after the initialization to avoid useless update
      this.$watch('value', (newValue, oldValue) => {
        logger.debug(`Change user setting "${this.settingsPath}" : ${oldValue} --> ${newValue}`)
        userSettings.set(this.settingsPath, newValue)
      })
    }
  }
</script>

<template>
  <div>
    <h2>Settings</h2>
    <el-form size="small">
      <el-form-item label="Test">
        <el-input-number controls-position="right" v-model="test"></el-input-number>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import userSettings from 'electron-settings'
  import logger from 'electron-log'

  export default {
    name: 'settings',
    data () {
      return {
        test: 0
      }
    },
    watch: {
      test: function (newValue, oldValue) {
        logger.debug(`Change setting test : ${oldValue} --> ${newValue}`)
        userSettings.set('test', newValue)
      }
    },
    mounted () {
      this.test = userSettings.get('test')
    }
  }
</script>

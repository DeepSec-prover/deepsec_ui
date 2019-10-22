<template>
  <el-form-item :label="label">
    <!-- Integer -->
    <el-input-number v-if="Number.isInteger(value)"
                     v-model="value"
                     controls-position="right"
                     :placeholder="placeholder"
                     :min="min"
                     :max="max"></el-input-number>
    <!-- Boolean -->
    <el-switch v-else-if="typeof value === 'boolean'"
               v-model="value"></el-switch>
    <!-- String -->
    <el-input v-else
              v-model="value"
              class="setting-item-text"
              :placeholder="placeholder"></el-input>
    <i v-show="!isDefault" :class="['el-icon-circle-check', 'edited', {'current-edit': currentEdit}]"></i>
  </el-form-item>
</template>

<script>
  import userSettings from 'electron-settings'
  import logger from 'electron-log'
  import { defaultUserSettings } from '../util/default-user-settings'

  export default {
    name: 'setting-item',
    props: {
      label: String,
      settingsPath: String,
      placeholder: {
        type: String,
        default: ''
      },
      min: {
        type: Number,
        default: -Infinity

      },
      max: {
        type: Number,
        default: Infinity
      }
    },
    data () {
      return {
        value: null,
        currentEdit: false
      }
    },
    computed: {
      isDefault: function () {
        return this.value === defaultUserSettings[this.settingsPath]
      }
    },
    mounted () {
      this.value = userSettings.get(this.settingsPath)

      // TODO try beforeCreate to avoid custom watcher
      // Set watcher after the initialization to avoid useless update
      this.$watch('value', (newValue, oldValue) => {
        logger.debug(`Change user setting "${this.settingsPath}" : ${oldValue} --> ${newValue}`)
        userSettings.set(this.settingsPath, newValue)
        this.currentEdit = true
      })
    }
  }
</script>

<style>
  .edited {
    color: #909399;
    opacity: 0.7;
    padding-left: 5px;
    font-size: 16px;
  }

  .current-edit {
    color: #67C23A;
  }

  .setting-item-text {
    width: 80% !important;
  }
</style>

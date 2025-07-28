<template>
  <el-form-item :label="label">
    <!-- Integer -->
    <el-input-number v-if="type === 'integer'"
                     v-model="value"
                     controls-position="right"
                     :placeholder="placeholder"
                     :min="min"
                     :max="max"></el-input-number>
    <!-- Boolean -->
    <el-switch v-else-if="type === 'boolean'"
               v-model="value"></el-switch>
    <!-- Choice -->
    <el-select v-else-if="type === 'choice'"
               v-model="value"
               :placeholder="placeholder">
      <el-option v-for="choice in choices" :key="choice" :label="choice" :value="choice"></el-option>
    </el-select>
    <!-- File -->
    <template v-else-if="type === 'file'">
      <el-input v-model="value"
                class="setting-item-file"
                :placeholder="placeholder"></el-input>
      <el-button icon="el-icon-document-add" @click="(selectFile())">Files ...</el-button>
    </template>
    <!-- String -->
    <el-input v-else
              v-model="value"
              class="setting-item-text"
              :placeholder="placeholder"></el-input>
    <!-- Edition indicator -->
    <i v-show="!isDefault" :class="['el-icon-circle-check', 'edited', {'current-edit': currentEdit}]"></i>
  </el-form-item>
</template>

<script>
import defaultValues  from '../util/default-values'
import { ipcRenderer } from 'electron'

export default {
  name: 'setting-item',
  props: {
    label: {
      type: String,
      required: true
    },
    settingsPath: {
      type: String,
      required: true
    },
    type: {
      type: String, // string|integer|boolean|choice
      default: 'string'
    },
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
    },
    choices: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      value: null,
      currentEdit: false,
      fileSelectionDone: false // Flag for checking the path after the selection
    }
  },
  computed: {
    isDefault: function () {
      return this.value === defaultValues[this.settingsPath]
    }
  },
  methods: {
    selectFile () {
        ipcRenderer.invoke('apiFile:open', this.value ).then(file => {
        this.fileSelectionDone = true
        this.value = file
      }).catch((_) => {/* Nothing to do if canceled or bad value */})
    }
  },
  beforeMount () {
    this.value = defaultValues[this.settingsPath]
    // Set watcher after the initialization to avoid useless update
    this.$watch('value', (newValue, oldValue) => {
      console.debug(`Change user setting "${this.settingsPath}" : ${oldValue} --> ${newValue}`)
      defaultValues[this.settingsPath] = newValue
      this.currentEdit = true

      // Trigger path checking after the selection,
      // can't be send before because the setting wasn't be saved
      if (this.fileSelectionDone) {
        this.$emit('file-selected')
        this.fileSelectionDone = false
      }
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

  .setting-item-file {
    padding-right: 5px;
    width: 70% !important;
  }
</style>

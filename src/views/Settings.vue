<template>
  <div>
    <h2>Settings</h2>
    <el-form size="small">
      <setting-item label="Test" settings-path="test"></setting-item>
      <setting-item label="Show Helpers" settings-path="showHelpers"></setting-item>
      <setting-item label="Name" settings-path="name"></setting-item>
    </el-form>
    <el-button @click="resetSettings()">Reset to default</el-button>
  </div>
</template>

<script>
  import { resetAll } from '../util/default-user-settings'
  import SettingItem from '../components/SettingItem'

  export default {
    name: 'settings',
    components: {
      SettingItem
    },
    methods: {
      resetSettings () {
        resetAll()
      }
    }
  }
</script>

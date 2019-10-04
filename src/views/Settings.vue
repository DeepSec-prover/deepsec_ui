<template>
  <div>
    <h2>Settings</h2>
    <el-row type="flex" justify="center">
      <el-col :xs="20" :sm="16" :md="12" :xl="6">
        <el-form size="small" :key="refreshKey" label-position="right" label-width="auto">
          <setting-item label="Test" settings-path="test"></setting-item>
          <setting-item label="Show Helpers" settings-path="showHelpers"></setting-item>
          <setting-item label="Name" settings-path="name"></setting-item>
        </el-form>
        <el-button @click="resetSettings()" icon="el-icon-refresh-left" size="mini" type="danger" plain>
          Reset to default
        </el-button>
      </el-col>
    </el-row>
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
    data () {
      return {
        refreshKey: 0
      }
    },
    methods: {
      resetSettings () {
        resetAll()
        // Changing the key force Vue to reload the components
        this.refreshKey += 1
      }
    }
  }
</script>

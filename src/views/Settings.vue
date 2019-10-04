<template>
  <div>
    <h2>Settings</h2>
    <el-row type="flex" justify="center">
      <el-col :xs="20" :sm="16" :md="12" :xl="6">
        <!-- Form -->
        <el-form size="small" :key="refreshKey" label-position="right" label-width="auto">
          <setting-item label="Test" settings-path="test"></setting-item>
          <setting-item label="Show Helpers" settings-path="showHelpers"></setting-item>
          <setting-item label="Name" settings-path="name"></setting-item>
        </el-form>
        <!-- Reset Settings -->
        <div id="reset-settings">
          <el-popover
            placement="top"
            v-model="resetConfirm">
            <p>Reset all settings to default values?</p>
            <div id="reset-buttons">
              <el-button size="mini" type="text" @click="resetConfirm = false">cancel</el-button>
              <el-button size="mini" type="danger" @click="resetSettings()">confirm</el-button>
            </div>
            <el-link slot="reference" :underline="false" icon="el-icon-refresh-left" type="danger">
              Reset
            </el-link>
          </el-popover>

        </div>
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
        refreshKey: 0,
        resetConfirm: false,
      }
    },
    methods: {
      resetSettings () {
        resetAll()
        // Changing the key force Vue to reload the components
        this.refreshKey += 1
        this.resetConfirm = false
      }
    }
  }
</script>

<style>
  #reset-settings {
    margin-top: 50px;
    text-align: center;
  }

  #reset-buttons {
    text-align: center;
  }
</style>

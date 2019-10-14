<template>
  <div>
    <h2>Settings</h2>
    <el-row type="flex" justify="center">
      <el-col :xs="20" :sm="16" :md="12" :xl="6">
        <!-- Form -->
        <el-form size="small" :key="refreshKey" label-position="right" label-width="auto">
          <!-- Interface -->
          <el-divider><i class="el-icon-picture-outline-round"></i> Interface</el-divider>
          <setting-item label="Show Helpers" settings-path="showHelpers"></setting-item>
          <!-- Environment -->
          <el-divider><i class="el-icon-files"></i> Environment</el-divider>
          <setting-item label="DeepSec API Path" settings-path="deepsecApiPath" placeholder="/path/to/deepsec-api"></setting-item>
          <setting-item label="Results directory" settings-path="resultsDirPath" placeholder="/path/to/results"></setting-item>
          <!-- Notifications -->
          <el-divider><i class="el-icon-bell"></i> Notifications</el-divider>
          <div class="centred-content">
            <el-button class="test-button" size="mini" @click="testNotification">Test Notification</el-button>
          </div>
        </el-form>
        <!-- Reset Settings -->
        <div id="reset-settings" class="centred-content">
          <el-popover
            placement="top"
            v-model="resetConfirm">
            <p>Reset all settings to default values?</p>
            <div class="centred-content">
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
      },
      testNotification () {
        this.$notification('Test title', 'Test description', 'info')
      }
    }
  }
</script>

<style>
  #reset-settings {
    margin-top: 50px;
  }
</style>

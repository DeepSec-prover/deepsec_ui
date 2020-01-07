<template>
  <div>
    <h2>Settings</h2>
    <el-row type="flex" justify="center">
      <el-col :xs="20" :sm="16" :md="12" :xl="6">
        <!-- Form -->
        <el-form @submit.native.prevent size="small" :key="refreshKey" label-position="right" label-width="auto">
          <!-- Interface -->
          <el-divider><i class="el-icon-picture-outline-round"></i> Interface</el-divider>
          <setting-item label="Show Helpers" settings-path="showHelpers"></setting-item>
          <!-- Environment -->
          <el-divider><i class="el-icon-files"></i> Environment</el-divider>
          <setting-item label="DeepSec API Path" settings-path="deepsecApiPath" placeholder="/path/to/deepsec_api"></setting-item>
          <p class="centred-content regular-text">Results directory : <i>{{ this.resultsDir ? this.resultsDir : 'not defined' }}</i></p>
          <div class="centred-content">
            <el-button size="mini" @click="checkApi">Check API</el-button>
          </div>
          <!-- Notifications -->
          <el-divider><i class="el-icon-bell"></i> Notifications</el-divider>
          <setting-item label="Duration (s)" settings-path="notificationDuration" :min="0" :max="10"></setting-item>
          <setting-item label="Batch notifications" settings-path="showBatchNotif"></setting-item>
          <setting-item label="Run notifications" settings-path="showRunNotif"></setting-item>
          <setting-item label="Query notifications" settings-path="showQueryNotif"></setting-item>
          <setting-item label="No auto dismiss error" settings-path="stickyErrorNotif"></setting-item>
          <div class="centred-content">
            <el-button class="test-button" size="mini" @click="testNotification">Test Notification</el-button>
          </div>
          <!-- Reset Settings -->
          <div id="reset-settings" class="centred-content">
            <el-popover placement="top" v-model="resetConfirm">
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
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { resetAll } from '../util/default-user-settings'
import SettingItem from '../components/SettingItem'
import userSettings from 'electron-settings'
import { ipcRenderer } from 'electron'

export default {
  name: 'settings',
  components: {
    SettingItem
  },
  data () {
    return {
      refreshKey: 0,
      resetConfirm: false,
      resultsDir: '',
      lastCheckedApiPath: ''
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
      this.$notification('Test title', 'Test description')
    },
    checkApi () {
      // Send checking signal to the main process
      ipcRenderer.send('refresh-api-path')
      this.resultsDir = userSettings.get('resultsDirPath', '')
      this.lastCheckedApiPath = userSettings.get('deepsecApiPath', '')
    }
  },
  mounted () {
    this.lastCheckedApiPath = userSettings.get('deepsecApiPath', '')
    this.resultsDir = userSettings.get('resultsDirPath', '')
  },
  beforeDestroy () {
    if (this.lastCheckedApiPath !== userSettings.get('deepsecApiPath', '')) {
      // Send checking signal to the main process
      ipcRenderer.send('refresh-api-path')
    }
  }
}
</script>

<style>
  #reset-settings {
    margin-top: 50px;
  }

  .test-button {
    margin-bottom: 15px !important;
  }
</style>

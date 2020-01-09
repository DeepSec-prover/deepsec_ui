<template>
  <div>
    <h2>Settings</h2>
    <el-row type="flex" justify="center">
      <el-col :sm="22" :md="16" :xl="9">
        <!-- Form -->
        <el-form @submit.native.prevent size="small" :key="refreshKey" label-position="right" label-width="auto">
          <!-- Interface -->
          <el-divider><i class="el-icon-picture-outline-round"></i> Interface</el-divider>
          <setting-item label="Show Helpers" settings-path="showHelpers" type="boolean"></setting-item>
          <!-- Environment -->
          <el-divider><i class="el-icon-files"></i> Environment</el-divider>
          <setting-item label="DeepSec API Path" settings-path="deepsecApiPath" placeholder="/path/to/deepsec_api" type="text"></setting-item>
          <p class="break-word centred-content regular-text">Results directory : <i>{{ this.resultsDir ? this.resultsDir : 'not defined' }}</i></p>
          <div class="centred-content">
            <el-button size="mini" @click="checkApi">Check API</el-button>
          </div>
          <!-- Notifications -->
          <el-divider><i class="el-icon-bell"></i> Notifications</el-divider>
          <setting-item label="Duration (s)" settings-path="notificationDuration" :min="0" :max="10" type="integer"></setting-item>
          <setting-item label="Batch notifications" settings-path="showBatchNotif" type="boolean"></setting-item>
          <setting-item label="Run notifications" settings-path="showRunNotif" type="boolean"></setting-item>
          <setting-item label="Query notifications" settings-path="showQueryNotif" type="boolean"></setting-item>
          <setting-item label="Sticky error notification" settings-path="stickyErrorNotif" type="boolean"></setting-item>
          <setting-item label="Sticky warning notification" settings-path="stickyWarningNotif" type="boolean"></setting-item>
          <div class="centred-content">
            <el-button class="test-button" size="mini" @click="testNotifications">Test Notifications</el-button>
          </div>
          <!-- Code Style -->
          <!-- TODO uncomment when multi themes feature -->
          <!--<el-divider><i class="el-icon-tickets"></i> Code Style</el-divider>
          <setting-item label="Theme" settings-path="codeStyleTheme" type="choice"
                        :choices="['coy', 'okaidia']"></setting-item>
          <spec-code :code="demoCode"></spec-code>
          <div id="code-example">
            Example inline code :
            <spec-code-inline code="test(ax_42)"></spec-code-inline>
          </div>-->
          <!-- Reset Settings-->
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
import SpecCodeInline from '../components/code/SpecCodeInline'
import SpecCode from '../components/code/SpecCode'
import demoCode from '../text-content/demoCode'

export default {
  name: 'settings',
  components: {
    SpecCode,
    SpecCodeInline,
    SettingItem
  },
  data () {
    return {
      refreshKey: 0,
      resetConfirm: false,
      resultsDir: '',
      lastCheckedApiPath: '',
      demoCode: ''
    }
  },
  methods: {
    resetSettings () {
      resetAll()
      // Changing the key force Vue to reload the components
      this.refreshKey += 1
      this.resetConfirm = false
    },
    testNotifications () {
      this.$notification('Test info notification', 'This one if for casual information.')
      setTimeout(() => {this.$notification('Test warning notification', 'This one deserve more attention...', 'warning')}, 500)
      setTimeout(() => {this.$notification('Test error notification', 'This one is critical, don\'t miss it!', 'error')}, 1000)
    },
    checkApi () {
      // Send checking signal to the main process
      ipcRenderer.send('refresh-api-path')
      this.resultsDir = userSettings.get('resultsDirPath', '')
      this.lastCheckedApiPath = userSettings.get('deepsecApiPath', '')
    }
  },
  beforeMount () {
    this.demoCode = demoCode
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

  #code-example {
    margin-top: 10px;
  }
</style>

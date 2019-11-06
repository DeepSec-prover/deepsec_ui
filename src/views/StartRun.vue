<template>
  <el-form :disabled="runStarting" id="start-run" size="mini" label-width="auto">
    <el-row>
      <!-- Files selection -->
      <spec-files-selection :disabled="runStarting" :files="currentFiles"></spec-files-selection>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="15">
        <el-row :gutter="20">
          <el-col :span="10">
            <!-- Error message -->
            <el-alert
                    id="failed-error-msg"
                    v-show="globalErrorMsg"
                    title="Fail to start run"
                    type="error"
                    :description="globalErrorMsg"
                    :closable="false"
                    show-icon></el-alert>
            <!-- Submit -->
            <el-button :loading="runStarting" :disabled="currentFiles.length === 0" size="default" type="success" icon="el-icon-video-play"
                       @click="submitForm()">
              Start{{ currentFiles.length > 1 ? ' Batch' : ' Run' }}
            </el-button>
          </el-col>
          <el-col :span="14" class="border-right">
            <!-- Default Semantic -->
            <form-item-helper label="Default Semantic" class="label-top" helper-id="runOptions.defaultSemantic">
              <el-radio-group v-model="currentConf.defaultSemantic">
                <helper helper-id="semantics.private">
                  <el-radio-button label="private">Private</el-radio-button>
                </helper>
                <helper helper-id="semantics.classic">
                  <el-radio-button label="classic">Classic</el-radio-button>
                </helper>
                <helper helper-id="semantics.eavesdrop">
                  <el-radio-button label="eavesdrop">Eavesdrop</el-radio-button>
                </helper>
              </el-radio-group>
            </form-item-helper>
            <!-- Distributed -->
            <el-form-item label="Distributed :" class="label-top" helper-id="runOptions.distributed">
              <el-radio-group v-model="currentConf.distributed">
                <helper helper-id="runOptions.distributed.auto">
                  <el-radio-button label="auto">Auto</el-radio-button>
                </helper>
                <helper helper-id="runOptions.distributed.true">
                  <el-radio-button :label="true">Yes</el-radio-button>
                </helper>
                <helper helper-id="runOptions.distributed.false">
                  <el-radio-button :label="false">No</el-radio-button>
                </helper>
              </el-radio-group>
            </el-form-item>
            <div v-show="currentConf.distributed === true">
              <!-- Nb jobs -->
              <form-item-helper label="Number jobs" helper-id="runOptions.nbJobs">
                <el-checkbox class="auto" v-model="currentConf.nbJobs.auto">Auto</el-checkbox>
                <el-input-number v-show="!currentConf.nbJobs.auto"
                                 v-model="currentConf.nbJobs.value"
                                 :min="nbWorkers === Number.POSITIVE_INFINITY ? 1 : nbWorkers"
                                 controls-position="right"></el-input-number>
              </form-item-helper>
              <!-- Nb local workers -->
              <form-item-helper label="Local workers" helper-id="runOptions.localWorkers">
                <el-checkbox class="auto" v-model="currentConf.localWorkers.auto">Auto</el-checkbox>
                <el-input-number v-show="!currentConf.localWorkers.auto"
                                 v-model="currentConf.localWorkers.value"
                                 :min="1"
                                 controls-position="right"></el-input-number>
              </form-item-helper>
              <!-- Timer -->
              <form-item-helper label="Round timer" helper-id="runOptions.roundTimer" id="round-timer">
                <el-input-number v-model="currentConf.roundTimer" :min="1" controls-position="right"></el-input-number>
              </form-item-helper>
              <div class="centred-content">
                <el-tag v-show="currentConf.nbServer() > 0" class="counter-tag" size="small" effect="plain">
                  Total worker <b>{{ nbWorkers === Number.POSITIVE_INFINITY ? 'Auto' : nbWorkers }}</b>
                </el-tag>
              </div>
            </div>
            <!-- Reset Config -->
            <div id="reset-config" class="centred-content">
              <el-link slot="reference" :underline="false" icon="el-icon-refresh-left" type="danger" @click="resetConf()">
                Reset
              </el-link>
            </div>
          </el-col>
        </el-row>
        <el-row v-show="filesIssues.length > 0">
          <el-divider></el-divider>
          <!-- Files issues -->
          <file-issues-list :files-issues="filesIssues"></file-issues-list>
        </el-row>
      </el-col>
      <el-col :span="9" v-show="currentConf.distributed === true">
        <!-- Add Distant server -->
        <el-button type="primary" icon="el-icon-plus" @click="currentConf.addServer()" size="mini">
          Add Distant Server
        </el-button>
        <el-tag class="counter-tag" id="server-count" size="small" effect="plain">{{ currentConf.nbServer() }}</el-tag>
        <div v-if="currentConf.nbServer() > 0">
          <transition-group name="el-zoom-in-top" tag="div" :duration="{ enter: 20 }">
            <el-card class="server-card" shadow="hover" v-for="server in currentConf.servers" :key="server.id">
              <!-- Remove Server -->
              <el-link class="remove-server"
                       :underline="false"
                       @click.prevent="currentConf.removeServer(server)"
                       icon="el-icon-close"
                       size="small">
              </el-link>
              <!-- Server Hostname -->
              <form-item-helper label="Hostname" helper-id="runOptions.server.host">
                <el-input placeholder="user@adress" v-model="server.host"></el-input>
              </form-item-helper>
              <!-- Server Local Path -->
              <form-item-helper label="Local path" helper-id="runOptions.server.path">
                <el-input placeholder="/usr/bin/deepsec" v-model="server.path"></el-input>
              </form-item-helper>
              <!-- Server Nb Workers -->
              <form-item-helper label="Workers" helper-id="runOptions.server.workers">
                <el-checkbox class="auto" v-model="server.workers.auto">Auto</el-checkbox>
                <el-input-number v-show="!server.workers.auto"
                                 v-model="server.workers.value"
                                 :min="1"
                                 controls-position="right"></el-input-number>
              </form-item-helper>
            </el-card>
          </transition-group>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
  import SpecFilesSelection from '../components/SpecFilesSelection'
  import FormItemHelper from '../components/helpers/FormItemHelper'
  import Helper from '../components/helpers/Helper'
  import FileIssuesList from '../components/FileIssuesList'
  import { ipcRenderer } from 'electron'
  import RunConfigModel from '../models/RunConfigModel'

  export default {
    name: 'start-run',
    props: {
      /**
       * Used as default run configuration.
       * These objects never change.
       */
      config: {
        type: Object,
        default: null
      },
      files: {
        type: Array,
        default: null
      }
    },
    components: {
      SpecFilesSelection,
      FormItemHelper,
      Helper,
      FileIssuesList
    },
    data () {
      return {
        currentFiles: [],
        currentConf: null,
        runStarting: false,
        globalErrorMsg: '',
        filesIssues: []
      }
    },
    computed: {
      nbWorkers: function () {
        if (this.currentConf.localWorkers.auto) {
          return Number.POSITIVE_INFINITY
        }

        let sum = this.currentConf.localWorkers.value

        for (let i = 0; i < this.currentConf.nbServer(); i++) {
          if (this.currentConf.servers[i].workers.auto) {
            return Number.POSITIVE_INFINITY
          }
          sum += this.currentConf.servers[i].workers.value
        }

        return sum
      }
    },
    methods: {
      submitForm () {
        this.runStarting = true
        this.globalErrorMsg = ''
        this.filesIssues = []

        // Send the run order
        ipcRenderer.send('deepsec-api:run', {
          'command': 'start_run',
          'input_files': this.currentFiles,
          'command_options': this.currentConf.toJson()
        })

        // Wait for the run confirmation or error message
        ipcRenderer.once('deepsec-api:result', (event, result) => {
          if (result.success) {
            this.runStarted()
          } else {
            // Global error
            if (result.error) {
              this.globalErrorMsg = result.error
            } else {
              this.globalErrorMsg = 'Unknown error.'
            }
            // Error or warning per files
            if (result.files_issues) {
              this.filesIssues = result.files_issues
            }
          }
          this.runStarting = false
        })
      },
      runStarted () {
        // TODO reset files list
      },
      resetConf () {
        this.currentConf = new RunConfigModel()
      }
    },
    beforeMount () {
      // Load default values (from props)
      this.currentFiles = this.files ? this.files : []
      this.currentConf = this.config ? this.config : new RunConfigModel()
    }
  }
</script>

<style>
  #start-run .el-input-number--mini {
    width: 100px;
  }

  .counter-tag {
    margin-left: 5px;
  }

  .server-card {
    margin-top: 10px;
    padding-top: 5px;
  }

  .server-card .el-card__body {
    padding: 20px 10px 10px 0;
  }

  .server-card .remove-server {
    position: absolute;
    z-index: 50;
    right: 20px;
    margin-top: -20px;
  }

  .server-card .remove-server:hover {
    color: #F56C6C !important;
  }

  .server-card .el-form-item {
    margin-bottom: 10px !important;
  }

  .label-top .el-form-item__content {
    margin-left: 0 !important;
    /*z-index: -999; TODO z-index issue for tooltip */
  }

  .label-top .el-radio-group {
    min-width: 230px;
  }

  .border-right {
    border-left: 1px solid #E4E7ED;
    border-right: 1px solid #E4E7ED;
  }

  #failed-error-msg {
    margin-bottom: 30px;
  }

  .auto {
    line-height: 29px;
    margin-right: 10px !important;
  }

  #reset-config {
    margin-top: 40px;
  }
</style>

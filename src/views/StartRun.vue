<template>
  <el-form @submit.native.prevent :disabled="runStarting" id="start-run" size="mini" label-width="auto">
    <el-row>
      <!-- Files selection -->
      <spec-files-selection :disabled="runStarting" :files="currentFiles"></spec-files-selection>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="15">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-input size="small" v-model="currentConf.title" placeholder="Optional title"
                      :maxlength="40" clearable>
            </el-input>
            <!-- Submit -->
            <el-button :loading="runStarting" :disabled="currentFiles.length === 0"
                       size="default" type="success" icon="el-icon-video-play" id="submit-run"
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
            <!-- TODO Change v-if to v-show when this issue is solved : https://github.com/ElemeFE/element/issues/17617 -->
            <div v-if="currentConf.distributed === true">
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
              <el-link :disabled="runStarting" slot="reference" :underline="false" icon="el-icon-refresh-left" type="danger" @click="resetConf()">
                Reset
              </el-link>
            </div>
          </el-col>
        </el-row>
        <!-- Global error message -->
        <el-row v-if="globalError">
          <el-divider></el-divider>
          <el-alert id="failed-error-msg"
                    type="error"
                    :title="globalError.title"
                    :closable="false"
                    effect="dark"
                    show-icon>
            <span v-html="globalError.message"></span>
            <template v-if="globalError.isInternal">
              <br>
              Please report the problem in the <a :href="settings.deepsecIssueUrl" @click.prevent="$openExternalLink">issue tracker</a>.
            </template>
          </el-alert>
        </el-row>
        <!-- Files issues -->
        <el-row v-show="filesIssues.length > 0">
          <el-divider></el-divider>
          <h3>Files errors :</h3>
          <file-issues-list :files-issues="filesIssues"></file-issues-list>
        </el-row>
        <!-- Host issues -->
        <el-row v-show="hostIssues.length > 0">
          <el-divider></el-divider>
          <h3>Distant servers errors :</h3>
          <host-issues-list :all-host-issues="hostIssues"></host-issues-list>
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
import SpecFilesSelection from '../components/spec-files/SpecFilesSelection'
import FormItemHelper from '../components/helpers/FormItemHelper'
import Helper from '../components/helpers/Helper'
import FileIssuesList from '../components/spec-files/FileIssuesList'
import HostIssuesList from '../components/spec-files/HostIssuesList'
import settings from '../../settings'
import RunConfigModel from '../models/RunConfigModel'
import logger from 'electron-log'
import ApiRemote from '../deepsec-api/ApiRemote'

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
    FileIssuesList,
    HostIssuesList
  },
  data () {
    return {
      currentFiles: [],
      currentConf: null,
      runStarting: false,
      globalError: null,
      filesIssues: [],
      hostIssues: [],
      settings: settings,
      apiRemote: null
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
      this.globalError = null
      this.filesIssues = []
      this.hostIssues = []

      // Clean user inputs (eg: trim)
      this.currentConf.preProcessData()

      // No ipc Id for now because we don't know the id of the batch.
      // It will be set on the batch started.
      this.apiRemote = new ApiRemote('start-run', null, false)

      // Wait for the run confirmation or error message
      this.apiRemote.onReply((event, result) => {
        logger.silly(`Run starting confirmation : ${JSON.stringify(result)}`)
        if (!result.success) {
          this.showGlobalError(result)
        }
        this.runStarting = false
        this.apiRemote.exit()
        this.apiRemote = null
      })

      // Send the run start order
      this.apiRemote.start(
        {
          'input_files': this.currentFiles,
          'command_options': this.currentConf.toJson()
        })
    },
    resetConf () {
      this.currentConf = new RunConfigModel()
    },
    showGlobalError (result) {
      let error = {}
      // Save internal flag for display tips
      error.isInternal = result.isInternal

      // Error title
      if (result.isInternal) {
        error.title = 'Internal error'
      } else {
        error.title = 'User error'
      }

      if (result.errorMsg !== '') {
        // Error message
        error.message = result.errorMsg
      } else {
        // Unknown error message
        error.message = 'No error message. Please check logs.'
      }

      // Error or warning per files
      if (result.files_issues) {
        this.filesIssues = result.files_issues
      }

      // Error or warning per files
      if (result.host_issues) {
        this.hostIssues = result.host_issues
      }

      // Set at the end to have only one UI update
      this.globalError = error
    }
  },
  beforeMount () {
    // Load default values (from props)
    this.currentFiles = this.files ? this.files : []
    this.currentConf = this.config ? this.config : new RunConfigModel()
  },
  destroyed () {
    if (this.apiRemote) {
      this.apiRemote.exit()
    }
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

  .auto {
    line-height: 29px;
    margin-right: 10px !important;
  }

  #reset-config {
    margin-top: 40px;
  }

  #submit-run {
    margin-top: 20px;
  }

  #failed-error-msg .el-alert__content {
    overflow-wrap: break-word;
    /*noinspection CssInvalidPropertyValue*/
    width: -webkit-fill-available;
    padding-right: 30px;
  }
</style>

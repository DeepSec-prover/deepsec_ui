<template>
  <el-form :disabled="running" id="start-run" size="mini" label-width="auto">
    <el-row>
      <!-- Files selection -->
      <spec-files-selection :disabled="running" :files="files"></spec-files-selection>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="6">
        <!-- Error message -->
        <el-alert
                id="failed-error-msg"
                v-show="runErrorMsg"
                title="Fail to start run"
                type="error"
                :description="runErrorMsg"
                :closable="false"
                show-icon></el-alert>
        <!-- Submit -->
        <el-button :loading="running" :disabled="files.length === 0" size="default" type="success" icon="el-icon-video-play" @click="submitForm()">
          Start{{ files.length > 1 ? ' Batch' : ' Run' }}
        </el-button>
      </el-col>
      <el-col :span="9" class="border-right">
        <!-- Default Semantic -->
        <form-item-helper label="Default Semantic" class="label-top" helper-id="runOptions.defaultSemantic">
          <el-radio-group v-model="runConf.defaultSemantic">
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
        <form-item-helper label="Distributed" helper-id="runOptions.isDistributed">
          <el-switch v-model="runConf.isDistributed"></el-switch>
          <el-tag v-show="runConf.isDistributed" class="counter-tag" size="small" effect="plain">
            <b>{{ nbWorkers }}</b> worker{{ nbWorkers > 1 ? 's' : '' }}
          </el-tag>
        </form-item-helper>
        <div v-show="runConf.isDistributed">
          <!-- Nb jobs -->
          <form-item-helper label="Nb jobs" helper-id="runOptions.nbJobs">
            <el-input-number v-model="runConf.nbJobs" :min="nbWorkers" controls-position="right"></el-input-number>
          </form-item-helper>
          <!-- Nb local workers -->
          <form-item-helper label="Local workers" helper-id="runOptions.nbLocalWorkers">
            <el-input-number v-model="runConf.nbLocalWorkers" :min="1" controls-position="right"></el-input-number>
          </form-item-helper>
          <!-- Timer -->
          <form-item-helper label="Timer" helper-id="runOptions.timer">
            <el-input-number v-model="runConf.timer" :min="1" controls-position="right"></el-input-number>
          </form-item-helper>
        </div>
      </el-col>
      <el-col :span="9" v-show="runConf.isDistributed">
        <!-- Add Distant server -->
        <el-button type="primary" icon="el-icon-plus" @click="addDistantServer" size="mini">
          Add Distant Server
        </el-button>
        <el-tag class="counter-tag" id="server-count" size="small" effect="plain">{{ runConf.servers.length }}</el-tag>
        <div v-if="runConf.servers.length > 0">
          <transition-group name="el-zoom-in-top" tag="div" :duration="{ enter: 20 }">
            <el-card class="server-card" shadow="hover" v-for="server in runConf.servers" :key="server.id">
              <!-- Remove Server -->
              <el-link class="remove-server"
                       :underline="false"
                       @click.prevent="removeServer(server)"
                       icon="el-icon-close"
                       size="small">
              </el-link>
              <!-- Server Hostname -->
              <form-item-helper label="Hostname" helper-id="runOptions.server.hostname">
                <el-input placeholder="user@adress" v-model="server.hostname"></el-input>
              </form-item-helper>
              <!-- Server Local Path -->
              <form-item-helper label="Local path" helper-id="runOptions.server.localPath">
                <el-input placeholder="/usr/bin/deepsec" v-model="server.localPath"></el-input>
              </form-item-helper>
              <!-- Server Nb Workers -->
              <form-item-helper label="Workers" helper-id="runOptions.server.nbWorkers">
                <el-input-number :min="1" controls-position="right" v-model="server.nbWorkers"></el-input-number>
              </form-item-helper>
            </el-card>
          </transition-group>
        </div>
      </el-col>
    </el-row>
  </el-form>
</template>

<script>
  import logger from 'electron-log'
  import SpecFilesSelection from '../components/SpecFilesSelection'
  import FormItemHelper from '../components/helpers/FormItemHelper'
  import Helper from '../components/helpers/Helper'
  import { ipcRenderer } from 'electron'

  export default {
    name: 'start-run',
    components: {
      SpecFilesSelection,
      FormItemHelper,
      Helper
    },
    data () {
      return {
        files: [],
        runConf: {
          defaultSemantic: 'private',
          nbJobs: 10,
          nbLocalWorkers: 10,
          timer: 180,
          isDistributed: true,
          servers: []
        },
        serversId: 0,
        running: false,
        runErrorMsg: ''
      }
    },
    computed: {
      nbWorkers: function () {
        let sum = this.runConf.nbLocalWorkers

        this.runConf.servers.forEach(server => {
          sum += server.nbWorkers
        })

        return sum
      }
    },
    methods: {
      addDistantServer () {
        this.runConf.servers.push({
          id: ++this.serversId,
          hostname: '',
          localPath: '',
          nbWorkers: 10
        })
      },
      removeServer (server) {
        let index = this.runConf.servers.indexOf(server)
        this.runConf.servers.splice(index, 1)
      },
      submitForm () {
        this.running = true
        this.runErrorMsg = ''
        logger.info(`Send new run :
        config : ${JSON.stringify(this.runConf)}
        files : ${this.files.join(', ')}`)

        // Send the run order
        ipcRenderer.send('deepsec-api:run', {
          'command': 'start_run',
          'input_files': this.files,
          'command_options': {
            'nb_jobs': this.runConf.nbJobs,
            'round_timer': this.runConf.timer,
            'default_semantics': this.runConf.defaultSemantic,
            'distant_workers': this.runConf.servers,
            'distributed': this.runConf.isDistributed ? this.runConf.nbLocalWorkers : 0
          }
        })

        // Wait for the run confirmation or error message
        ipcRenderer.once('deepsec-api:result', (event, errorMsg) => {
          if (!errorMsg || errorMsg.length === 0) {
            this.runStarted()
          } else {
            this.runErrorMsg = errorMsg
          }
          this.running = false
        })
      },
      runStarted () {
        // TODO reset files list
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

  .border-right {
    border-left: 1px solid #E4E7ED;
    border-right: 1px solid #E4E7ED;
  }

  #failed-error-msg {
    margin-bottom: 30px;
  }
</style>

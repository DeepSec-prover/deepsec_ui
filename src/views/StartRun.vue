<template>
  <el-form id="start-run" size="mini" label-width="auto" label-suffix=" :">
    <el-row>
      <el-col :span="8">
        <!-- Files selection -->
        <spec-files-selection :files="files"></spec-files-selection>
        <!-- Submit -->
        <el-button :disabled="files.length === 0" size="medium" type="success" icon="el-icon-video-play" @click="submitForm()">
          Start Run{{ files.length > 1 ? "s" : "" }}
        </el-button>
      </el-col>
      <el-col :span="8">
        <!-- Default Semantic -->
        <el-form-item label="Default Semantic" class="label-top">
          <el-radio-group v-model="runConf.defaultSemantic">
            <el-radio-button label="private">Private</el-radio-button>
            <el-radio-button label="classic">Classic</el-radio-button>
            <el-radio-button label="eavesdrop">Eavesdrop</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <!-- Distributed -->
        <el-form-item label="Distributed">
          <el-switch v-model="runConf.isDistributed"></el-switch>
          <el-tag v-show="runConf.isDistributed" class="counter-tag" size="small" effect="plain">
            <b>{{ nbWorkers }}</b> worker{{ nbWorkers > 1 ? "s" : "" }}
          </el-tag>
        </el-form-item>
        <div v-show="runConf.isDistributed">
          <!-- Nb jobs -->
          <el-form-item label="Nb jobs">
            <el-input-number v-model="runConf.nbJobs" :min="nbWorkers" controls-position="right"></el-input-number>
          </el-form-item>
          <!-- Nb local workers -->
          <el-form-item label="Local workers">
            <el-input-number v-model="runConf.nbLocalWorkers" :min="1" controls-position="right"></el-input-number>
          </el-form-item>
          <!-- Timer -->
          <el-form-item label="Timer">
            <el-input-number v-model="runConf.timer" :min="1" controls-position="right"></el-input-number>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="8" v-show="runConf.isDistributed">
        <!-- Add Distant server -->
        <el-button type="primary" icon="el-icon-plus" @click="addDistantServer" size="mini">
          Add Distant Server
        </el-button>
        <el-tag class="counter-tag" id="server-count" size="small" effect="plain">{{ runConf.servers.length }}</el-tag>
        <div v-if="runConf.servers.length > 0">
          <transition-group name="el-zoom-in-top" tag="div">
            <el-card class="server-card" shadow="hover" v-for="server in runConf.servers" :key="server.id">
              <!-- Remove Server -->
              <el-link class="remove-server" @click.prevent="removeServer(server)" icon="el-icon-close" size="small">
              </el-link>
              <!-- Server Hostname -->
              <el-form-item label="Hostname">
                <el-input placeholder="user@adress" v-model="server.hostname"></el-input>
              </el-form-item>
              <!-- Server Local Path -->
              <el-form-item label="Local path">
                <el-input placeholder="/usr/bin/deepsec" v-model="server.localPath"></el-input>
              </el-form-item>
              <!-- Server Nb Workers -->
              <el-form-item label="Workers">
                <el-input-number
                  :min="1"
                  controls-position="right"
                  v-model="server.nbWorkers">
                </el-input-number>
              </el-form-item>
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

  export default {
  name: 'start-run',
  components: {
    SpecFilesSelection
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
      serversId: 0
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
      logger.info(`Start new run : ${JSON.stringify(this.runConf)}`)
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
    right: 10px;
    margin-top: -20px;
  }

  .server-card .remove-server:hover:after {
    border-bottom-style: none !important;
  }

  .server-card .remove-server:hover {
    color: #F56C6C !important;
  }

  .server-card .el-form-item {
    margin-bottom: 10px !important;
  }

  .label-top .el-form-item__content {
    margin: 0 !important;
    padding: 0 !important;
  }
</style>

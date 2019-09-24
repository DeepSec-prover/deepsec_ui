<template>
  <el-form id="start-run" label-position="left" size="mini">
    <el-row>
      <el-col :span="8">
        <el-button>Select file(s)...</el-button>
        <el-button type="success" @click="submitForm()">Submit</el-button>
      </el-col>
      <el-col :span="8">
        <!-- Default Semantic -->
        <el-form-item label="Default Semantic">
          <el-radio-group v-model="runConf.defaultSemantic">
            <el-radio-button label="private">Private</el-radio-button>
            <el-radio-button label="classic">Classic</el-radio-button>
            <el-radio-button label="eavesdrop">Eavesdrop</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <!-- Distributed -->
        <el-form-item label="Distributed">
          <el-switch v-model="runConf.isDistributed"></el-switch>
        </el-form-item>
        <div v-show="runConf.isDistributed">
          <!-- Nb jobs -->
          <el-form-item label="Nb jobs">
            <el-input-number v-model="runConf.nbJobs" :min="1" controls-position="right"></el-input-number>
          </el-form-item>
          <!-- Nb process local -->
          <el-form-item label="Nb process local">
            <el-input-number v-model="runConf.nbProcessLocal" :min="1" :max="runConf.nbJobs" controls-position="right"></el-input-number>
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
          Add Distant server
        </el-button>
        <el-tag id="server-count" size="small" effect="plain">{{ runConf.servers.length }}</el-tag>
        <div v-if="runConf.servers.length > 0">
          <transition-group name="el-zoom-in-top" tag="div">
            <el-card class="server-card" shadow="hover" v-for="server in runConf.servers" :key="server.id">
              <!-- Remove Server -->
              <el-link class="remove-server" @click.prevent="removeServer(server)" icon="el-icon-close" size="small">
              </el-link>
              <!-- Server Hostname -->
              <el-form-item label="Hostname">
                <el-input v-model="server.hostname"></el-input>
              </el-form-item>
              <!-- Server Local Path -->
              <el-form-item label="Local path">
                <el-input v-model="server.localPath"></el-input>
              </el-form-item>
              <!-- Server Nb Process -->
              <el-form-item label="Nb Process">
                <el-input-number
                  :min="1"
                  :max="runConf.nbJobs"
                  controls-position="right"
                  v-model="server.nbProcess">
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

  export default {
    name: 'preferences',
    data () {
      return {
        runConf: {
          defaultSemantic: 'private',
          nbJobs: 10,
          nbProcessLocal: 10,
          timer: 180,
          isDistributed: true,
          servers: []
        },
        serversId: 0
      }
    },
    methods: {
      addDistantServer () {
        this.runConf.servers.push({
          id: ++this.serversId,
          hostname: '',
          localPath: '',
          nbProcess: 10
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

  #start-run .el-form-item__label::after {
    content: " : ";
  }

  #server-count {
    margin-left: 5px;
  }

  .server-card {
    margin-top: 10px;
    padding-top: 5px;
  }

  .server-card .el-card__body {
    padding: 10px;
  }

  .server-card .remove-server {
    position: absolute;
    z-index: 50;
    right: 10px;
    margin-top: -5px;
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

</style>
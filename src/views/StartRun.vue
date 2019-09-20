<template>
  <el-form label-position="left">
    <el-row>
      <el-col :span="8">
        <el-button>Select file(s)...</el-button>
        <el-button type="success" @click="submitForm()">Submit</el-button>
      </el-col>
      <el-col :span="8">
        <!-- Default Semantic -->
        <el-form-item label="Default Semantic">
          <el-radio-group v-model="runConf.defaultSemantic" size="mini">
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
            <el-input-number v-model="runConf.nbJobs" :min="1" controls-position="right" size="mini"></el-input-number>
          </el-form-item>
          <!-- Nb process local -->
          <el-form-item label="Nb process local">
            <el-input-number v-model="runConf.nbProcessLocal" :min="1" :max="runConf.nbJobs" controls-position="right" size="mini"></el-input-number>
          </el-form-item>
          <!-- Timer -->
          <el-form-item label="Timer">
            <el-input-number v-model="runConf.timer" :min="1" controls-position="right" size="mini"></el-input-number>
          </el-form-item>
        </div>
      </el-col>
      <el-col :span="8" v-show="runConf.isDistributed">
        <!-- Add Distant server -->
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="addDistantServer">
          Add Distant server
        </el-button>
        <el-tag id="server-count" size="small" effect="plain">{{ runConf.servers.length }}</el-tag>
        <div v-if="runConf.servers.length > 0">
          <el-card shadow="never" v-for="server in runConf.servers">
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
            <!-- Remove Server -->
            <el-button @click.prevent="removeServer(server)">Delete</el-button>
          </el-card>
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
        }
      }
    },
    methods: {
      addDistantServer () {
        this.runConf.servers.push({
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

<style scoped>
  .el-input-number--mini {
    width: 100px;
  }

  #server-count {
    margin-left: 5px;
  }
</style>

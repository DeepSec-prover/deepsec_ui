<template>
  <el-form id="start-run" size="mini" label-width="auto" label-suffix=" :">
    <el-row>
      <el-col :span="8">
        <!-- File and directory support, only one dialog button -->
        <el-button v-if="dialogFileAndDirectorySupported" @click="selectFiles(true, true)" size="medium"
                   icon="el-icon-document-add">
          {{ addOrSelect }} file(s)...
        </el-button>
        <!-- No file and directory support, tow dialog buttons -->
        <div v-else>
          <el-button @click="selectFiles(false, true)" size="medium" icon="el-icon-folder-add">
            {{ addOrSelect }} directory ...
          </el-button>
          <el-button @click="selectFiles(true, false)" size="medium" icon="el-icon-document-add">
            {{ addOrSelect }} file(s) ...
          </el-button>
        </div>
        <!-- File List -->
        <ul v-if="hasSelectedFile">
          <li v-for="file in filesSet" >{{ file }}</li>
        </ul>
        <p v-else>
          Please select at least one file or folder.
        </p>
        <!-- Submit -->
        <el-button :disabled="!hasSelectedFile" size="medium" type="success" icon="el-icon-video-play" @click="submitForm()">
          Start Run{{ filesSet.length > 1 ? "s" : "" }}
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
          <el-tag v-show="runConf.isDistributed" class="counter-tag" id="process-count" size="small" effect="plain">
            {{ nbProcess }} process
          </el-tag>
        </el-form-item>
        <div v-show="runConf.isDistributed">
          <!-- Nb jobs -->
          <el-form-item label="Nb jobs">
            <el-input-number v-model="runConf.nbJobs" :min="nbProcess" controls-position="right"></el-input-number>
          </el-form-item>
          <!-- Nb process local -->
          <el-form-item label="Nb process local">
            <el-input-number v-model="runConf.nbProcessLocal" :min="1" controls-position="right"></el-input-number>
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
              <!-- Server Nb Process -->
              <el-form-item label="Nb Process">
                <el-input-number
                  :min="1"
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
  import { openSpecFilesRenderer } from '../util/open-files-dialogs'

  export default {
  name: 'preferences',
  data () {
    return {
      filesSet: new Set(), // Sets are not watched by Vue2
      files: [], // This array is watched and contains a copy of the set
      runConf: {
        defaultSemantic: 'private',
        nbJobs: 10,
        nbProcessLocal: 10,
        timer: 180,
        isDistributed: true,
        servers: []
      },
      serversId: 0,
      // Only mac OS support file and directory selection in th same dialog
      dialogFileAndDirectorySupported: process.platform === 'darwin'
    }
  },
  computed: {
    nbProcess: function () {
      let sum = this.runConf.nbProcessLocal

      this.runConf.servers.forEach(server => {
        sum += server.nbProcess
      })

      return sum
    },
    addOrSelect: function () {
      return this.files.length > 0 ? "Add" : "Select"
    },
    hasSelectedFile: function () {
      return this.files.length > 0
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
    },
    selectFiles (files, directories) {
      openSpecFilesRenderer(files, directories).then(files => {
        // Add files to the Set (duplicate are skipped)
        files.forEach(file => {
          this.filesSet.add(file)
          // Copy the set because Vue2 can only watch an array
          this.files = Array.from(this.filesSet)
        })
      }).catch((_) => {
        // Nothing to do if canceled or bad value
      })
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

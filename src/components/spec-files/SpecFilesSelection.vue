<template>
  <div id="file-selection">
    <el-row type="flex" justify="space-between">
      <el-col>
        <!-- File and directory support, only one dialog button -->
        <el-button v-if="fileAndDirectorySupported" @click="selectFiles(true, true)" size="medium"
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
      </el-col>
      <el-col v-if="hasSelectedFile" class="right-align">
        <el-tag effect="plain" class="file-count"><b>{{ files.length }}</b> file{{ files.length > 1 ? 's' : '' }}</el-tag>
        <el-button size="small" icon="el-icon-delete" :disabled="files.length === 0" @click="resetFiles">
          Clear file{{ files.length > 1 ? 's' : '' }}
        </el-button>
      </el-col>
    </el-row>
    <!-- File List -->
    <el-divider></el-divider>
    <div v-if="hasSelectedFile">
      <files-list :disabled="disabled" :files="files" v-on:remove="remove($event)"></files-list>
    </div>
    <p class="el-upload__tip" v-else>
      Please select at least one file or folder.
    </p>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import FilesList from './FilesList'

export default {
  name: 'spec-files-selection',
  components: {
    FilesList
  },
  props: {
    files: Array, // This array is watched and contains a the file paths
    disabled: Boolean
  },
  data () {
    return {
      // Copy of the files array to check duplicate
      // Need the array because sets are not watched by Vue2
      filesSet: null,
      // Only mac OS support file and directory selection in th same dialog
      fileAndDirectorySupported: process.platform === 'darwin'
    }
  },
  computed: {
    addOrSelect: function () {
      return this.files.length > 0 ? 'Add' : 'Select'
    },
    hasSelectedFile: function () {
      return this.files.length > 0
    }
  },
  methods: {
    async selectFiles (files, directories) {
        ipcRenderer.invoke('specFiles:open', { files, directories }).then(files => {
        // Add files to the Set (duplicate are skipped)
        files.forEach(file => {
          if (!this.filesSet.has(file)) {
            // Copy the set because Vue2 can only watch an array
            // But the Set is convenient to filter duplicates
            this.filesSet.add(file)
            this.files.push(file)
          }
        })
      }).catch((_) => {
        // Nothing to do if canceled or bad value
      })
    },
    resetFiles () {
      this.filesSet.clear()
      this.files.splice(0, this.files.length) // Empty the array in place
    },
    remove (file) {
      let index = this.files.indexOf(file)

      if (index !== -1) {
        this.files.splice(index, 1)
        this.filesSet.delete(file)
      }
    }
  },
  beforeMount () {
    // Copy the content of the array to the set
    this.filesSet = new Set(this.files)
  }
}
</script>

<style>
  #file-selection {
    background: #e5e9f2;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 20px;
  }

  .right-align {
    text-align: right;
  }

  .file-count {
    margin-right: 10px;
  }
</style>

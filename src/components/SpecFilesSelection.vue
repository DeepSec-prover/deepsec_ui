<template>
  <div>
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
    <!-- File List -->
    <div v-if="hasSelectedFile">
      <ul>
        <li v-for="file in files">{{ file }}</li>
      </ul>
      <el-tag effect="plain"><b>{{ files.length }}</b> file{{ files.length > 1 ? "s" : "" }} selected</el-tag>
    </div>
    <p v-else>
      Please select at least one file or folder.
    </p>
  </div>
</template>

<script>
  import { openSpecFilesRenderer } from '../util/open-files-dialogs'

  export default {
  name: 'spec-files-selection',
  props: {
    files: Array // This array is watched and contains a the file paths
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
    selectFiles (files, directories) {
      openSpecFilesRenderer(files, directories).then(files => {
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
    }
  },
  mounted () {
    // Copy the content of the array to the set
    this.filesSet = new Set(this.files)
  }
}
</script>

<style scoped>

</style>

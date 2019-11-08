<template>
  <el-collapse :value="openFile">
    <el-collapse-item v-for="fileIssues in filesIssues" :name="fileIssues.file">
      <template slot="title">
        {{ fileName(fileIssues.file) }}
        <el-tag class="tag-status" v-if="fileIssues.error_msg" effect="dark" type="danger" size="mini">
          1 <i class="el-icon-error"></i>
        </el-tag>
        <el-tag  class="tag-status" v-if="fileIssues.warnings && fileIssues.warnings.length > 0" effect="dark" type="warning" size="mini">
          {{ fileIssues.warnings.length }} <i class="el-icon-warning"></i>
        </el-tag>
      </template>
      <el-alert class="file-issue" v-if="fileIssues.error_msg" type="error" :description="fileIssues.error_msg" :closable="false"></el-alert>
      <el-alert class="file-issue" v-for="warning in fileIssues.warnings" type="warning" :description="warning" :closable="false"></el-alert>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
  import SpecFileMixin from './spec-files-mixin'

  export default {
    name: 'file-issues-list',
    mixins: [SpecFileMixin],
    props: {
      filesIssues: Array
    },
    data () {
      return {
        openFile: ''
      }
    },
    beforeMount () {
      // If small content show it
      if (this.filesIssues.length === 1) {
        if (this.filesIssues[0].warnings.length < 10) {
          this.openFile = this.filesIssues[0].file
        }
      }
    }
  }
</script>

<style scoped>
  .tag-status {
    margin-left: 4px;
  }

  .file-issue + .file-issue {
    margin-top: 10px;
  }
</style>

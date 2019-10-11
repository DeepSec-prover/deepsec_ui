<template>
  <el-collapse>
    <el-collapse-item v-for="file in filesIssues">
      <template slot="title">
        The spec file name
        <el-tag class="tag-status" v-if="file.error_msg" effect="dark" type="danger" size="mini">
          1 <i class="el-icon-error"></i>
        </el-tag>
        <el-tag  class="tag-status" v-if="file.warnings && file.warnings.length > 0" effect="dark" type="warning" size="mini">
          {{ file.warnings.length }} <i class="el-icon-warning"></i>
        </el-tag>
      </template>
      <el-alert class="file-issue" v-if="file.error_msg" type="error" :description="file.error_msg" :closable="false"></el-alert>
      <el-alert class="file-issue" v-for="warning in file.warnings" type="warning" :description="warning" :closable="false"></el-alert>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
  export default {
    name: 'file-issues-list',
    props: {
      filesIssues: Array
    },
    data () {
      return {}
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

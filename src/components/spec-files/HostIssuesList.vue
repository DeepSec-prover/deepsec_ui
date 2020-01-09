<template>
  <el-collapse :value="openHost">
    <el-collapse-item v-for="hostIssues in allHostIssues" :name="hostIssues.host">
      <template slot="title">
        {{ hostIssues.host }}
        <el-tag class="tag-status" effect="dark" type="danger" size="mini"> {{ hostIssues.error_msgs.length }} <i class="el-icon-error"></i></el-tag>
      </template>
      <el-alert class="host-issue" v-for="error_msg in hostIssues.error_msgs" type="error" :description="error_msg" :closable="false"></el-alert>
    </el-collapse-item>
  </el-collapse>
</template>

<script>

export default {
  name: 'host-issues-list',
  props: {
    allHostIssues: Array
  },
  data () {
    return {
      openHost: ''
    }
  },
  beforeMount () {
    // If small content show it
    if (this.allHostIssues.length === 1) {
      this.openHost = this.allHostIssues[0].host
    }
  }
}
</script>

<style scoped>
  .tag-status {
    margin-left: 4px;
  }

  .host-issue + .host-issue {
    margin-top: 10px;
  }
</style>

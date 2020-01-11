<template>
  <el-collapse-item>
    <template slot="title">
      <h3>
        <i class="el-icon-warning color-canceled"></i> {{ warnings.length }} Warnings {{ inQuery ? 'found in input file' : ''}}
      </h3>
    </template>
    <el-alert class="run-issue" v-for="warning in warnings" type="warning" :description="warning" :closable="false"></el-alert>
  </el-collapse-item>
</template>

<script>

export default {
  name: 'run-warnings',
  props: {
    warnings: {
      type: Array,
      required: true
    },
    inQuery: Boolean // Not required
  }
}
</script>

<style scoped>
  .run-issue {
    margin-top: 5px;
  }
</style>

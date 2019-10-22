<template>
  <div>
    <el-breadcrumb id="breadcrumb" separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">batch</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">run</a>
        <el-dropdown trigger="click">
          <i class="el-icon-arrow-down dropdown-link"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>run name</el-dropdown-item>
            <el-dropdown-item>run name</el-dropdown-item>
            <el-dropdown-item>run name</el-dropdown-item>
            <el-dropdown-item>run name</el-dropdown-item>
            <el-dropdown-item>run name</el-dropdown-item>
            <el-dropdown-item>run name</el-dropdown-item>
            <el-dropdown-item>run name</el-dropdown-item>
            <el-dropdown-item>run name</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        query
        <el-dropdown trigger="click">
          <i class="el-icon-arrow-down dropdown-link"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>query 2</el-dropdown-item>
            <el-dropdown-item>query 3</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <h2><i :class="[icons[query.status], query.status]"></i> Query {{ text.status[query.status] }}</h2>

    <el-card>
      <span slot="header"><i class="el-icon-s-data"></i> Summary</span>
      <query-summary :query="query"></query-summary>
    </el-card>

    <el-row type="flex" :gutter="10" justify="center">
      <el-col :lg="12" :xl="8" v-for="(process, index) in processesStr">
        <h3>Process {{ index + 1 }} </h3>
        <spec-code :code="process"></spec-code>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import icons from '../text-content/icons'
  import text from '../text-content/text'
  import { formatProcess } from '../util/process-parser'
  import QuerySummary from '../components/query/QuerySummary'
  import SpecCode from '../components/SpecCode'

  export default {
    name: 'query',
    components: {
      QuerySummary,
      SpecCode
    },
    props: {
      query: Object
    },
    data () {
      return {
        icons: icons,
        text: text
      }
    },
    computed: {
      processesStr: function () {
        return this.query.processes.map(p => formatProcess(p, this.query.atomicData))
      }
    }
  }
</script>

<style scoped>

</style>

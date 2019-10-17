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

    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-s-data"></i> Summary</span>
        <query-summary :query="query"></query-summary>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-time"></i> Duration</span>
        Duration
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
  import icons from '../text-content/icons'
  import text from '../text-content/text'
  import QuerySummary from '../components/query/QuerySummary'

  export default {
    name: 'query',
    components: {
      QuerySummary
    },
    mixins: [status],
    props: {
      query: Object
    },
    data () {
      return {
        icons: icons,
        text: text
      }
    }
  }
</script>

<style scoped>
 #breadcrumb {
   margin-bottom: 20px;
 }

  .dropdown-link {
    cursor: pointer;
  }
</style>

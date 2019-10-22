<template>
  <el-collapse-item :name="query.path">
    <template slot="title">
      <h3>
        <i :class="[icons[query.status], 'color-' + query.status]"></i> Query {{ query.index }}
        <el-tag size="small" class="query-result" :type="query.attackFound() ? 'danger' : 'success'">
          {{ query.shortResultDescription() }}
        </el-tag>
        <el-button size="mini" class="open-query" @click="openQuery(query.path)">
          Details <i class="el-icon-top-right"></i>
        </el-button>
      </h3>
    </template>
    <query-summary :query="query"></query-summary>
  </el-collapse-item>
</template>

<script>
  import icons from '../../text-content/icons'
  import QuerySummary from './QuerySummary'

  export default {
    name: 'query-collapsible',
    components: {
      QuerySummary
    },
    props: {
      query: Object
    },
    data () {
      return {
        icons: icons
      }
    },
    methods: {
      openQuery (path) {
        this.$router.push({ name: 'query', params: { 'path': path } })
      }
    }
  }
</script>

<style scoped>
  .open-query, .query-result {
    margin-left: 12px;
  }
</style>

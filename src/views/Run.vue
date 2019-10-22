<template>
  <result-layout :result-object="run">
    <template slot="summary">
      <el-card>
        <div slot="header"><i class="el-icon-s-data"></i> Summary</div>

        <!-- Show error message if present -->
        <el-alert v-if="run.errorMsg" title="Error" type="error" :description="run.errorMsg" show-icon :closable="false"></el-alert>

        <dl class="in-line">
          <dt>File</dt>
          <dd>{{ run.inputFileName() }}</dd> <!-- TODO open file link -->
          <dt>Nb query</dt>
          <dd>{{ run.nbQueries() }}</dd>
          <template v-if="run.startTime">
            <dt>Start time</dt>
            <dd>{{ run.startTime.toLocaleDateString() }} {{ run.startTime.toLocaleTimeString() }}</dd>
            <dt>Running time</dt>
            <dd>
              <duration :start-time="run.startTime" :end-time="run.endTime"></duration>
            </dd>
          </template>
        </dl>
      </el-card>
    </template>
    <template slot="details">
      <!-- TODO show warnings -->

      <el-collapse v-model="openedSummary">
        <el-collapse-item v-for="(query, index) in run.queries" :name="query.path">
          <template slot="title">
            <h3>
              <i :class="[icons[query.status], query.status]"></i> Query {{ index + 1 }}
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
      </el-collapse>
    </template>
  </result-layout>
</template>

<script>
  import icons from '../text-content/icons'
  import Duration from '../components/Duration'
  import QuerySummary from '../components/query/QuerySummary'
  import ResultLayout from '../components/results/ResultLayout'

  export default {
    name: 'run',
    components: {
      Duration,
      QuerySummary,
      ResultLayout
    },
    props: {
      run: Object
    },
    data () {
      return {
        icons: icons,
        openedSummary: []
      }
    },
    methods: {
      openQuery (path) {
        this.$router.push({ name: 'query', params: { 'path': path } })
      }
    },
    beforeMount () {
      // If few query show all summaries
      if (this.run.nbQueries() <= 5) {
        this.openedSummary = this.run.queries.map(q => q.path)
      }
    }
  }
</script>

<style scoped>
  .open-query, .query-result {
    margin-left: 12px;
  }
</style>

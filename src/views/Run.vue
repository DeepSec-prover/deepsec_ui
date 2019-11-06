<template>
  <result-layout :result-object="run">

    <!-- Actions -->
    <template slot="actions">
      <router-link :to="{name: 'start-run',
      params: { config: run.batch.computedOptions, files: [run.path] }}">
        <el-button type="primary" size="small" icon="el-icon-refresh-right" plain>
          Restart Run
        </el-button>
      </router-link>
    </template>

    <!-- Summary -->
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

    <!-- Details -->
    <template slot="details">
      <!-- TODO show warnings -->
      <el-collapse v-model="openedSummary">
        <query-collapsible v-for="query in run.queries" :query="query"></query-collapsible>
      </el-collapse>
    </template>
  </result-layout>
</template>

<script>
  import Duration from '../components/Duration'
  import QueryCollapsible from '../components/query/QueryCollapsible'
  import ResultLayout from '../components/results/ResultLayout'

  export default {
    name: 'run',
    components: {
      Duration,
      QueryCollapsible,
      ResultLayout
    },
    props: {
      run: Object
    },
    data () {
      return {
        openedSummary: []
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

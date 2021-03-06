<template>
  <result-layout :result-object="run">

    <!-- Actions -->
    <template slot="actions">
      <router-link :to="{name: 'start-run',
      params: { config: run.batch.computedOptions, files: [run.inputFileAbsolutePath()] }}">
        <el-button type="primary" size="small" icon="el-icon-refresh-right" plain>
          Restart Run
        </el-button>
      </router-link>
    </template>

    <!-- Progression -->
    <template slot="progression">
      Queries completed : {{run.nbQueriesCompleted()}}/{{run.nbQueries()}}
    </template>

    <!-- Summary -->
    <template slot="summary">
      <el-card>
        <div slot="header"><i class="el-icon-s-data"></i> Summary</div>

        <!-- Show error message if present -->
        <el-alert v-if="run.errorMsg" title="Error" type="error" :description="run.errorMsg" show-icon :closable="false"></el-alert>

        <el-row>
          <el-col :lg="12">
            <dl class="in-line">
              <dt>File</dt>
              <dd>{{ run.inputFileName() }}</dd> <!-- TODO open file link -->
              <dt>Nb query</dt>
              <dd>{{ run.nbQueries() }}</dd>
              <template v-if="run.batch.debug">
                <dt>Debug</dt>
                <dd>
                  <el-tag size="mini" type="danger"><i class="el-icon-view"></i> yes</el-tag>
                </dd>
              </template>
            </dl>
          </el-col>
          <el-col :lg="12" v-if="run.startTime">
            <dl class="in-line">
              <dt>Start time</dt>
              <dd>
                <date :date="run.startTime"></date>
              </dd>
              <template v-if="run.endTime">
                <dt>End time</dt>
                <dd>
                  <date :date="run.endTime"></date>
                </dd>
              </template>
              <dt>Running time</dt>
              <dd>
                <duration :start-time="run.startTime" :end-time="run.endTime"></duration>
              </dd>
              <template v-if="run.maxMemoryUsed () != 0">
                <dt>Max Memory</dt>
                <dd>
                  <helper helper-id="maxMemory" text-content>
                    <memory :memory="run.maxMemoryUsed ()"></memory>
                  </helper>
                </dd>
              </template>
            </dl>
          </el-col>
        </el-row>
      </el-card>
    </template>

    <!-- Details -->
    <template slot="details">
      <el-collapse v-model="openedSummary">
        <run-warnings :warnings="run.warnings" v-if="run.warnings && run.warnings.length > 0"></run-warnings>
        <query-collapsible v-for="query in run.queries" :query="query"></query-collapsible>
      </el-collapse>
    </template>
  </result-layout>
</template>

<script>
import RunWarnings from '../components/RunWarnings'
import Date from '../components/Date'
import Memory from '../components/Memory'
import Duration from '../components/Duration'
import QueryCollapsible from '../components/query/QueryCollapsible'
import ResultLayout from '../components/results/ResultLayout'
import RunModel from '../models/RunModel'
import Helper from '../components/helpers/Helper'

export default {
  name: 'run',
  components: {
    Helper,
    Duration,
    Date,
    QueryCollapsible,
    ResultLayout,
    Memory,
    RunWarnings
  },
  props: {
    path: String
  },
  data () {
    return {
      openedSummary: [],
      run: undefined
    }
  },
  methods: {
    setupResult () {
      this.run = new RunModel(this.path, true, true)
      this.run.queries.forEach(q => q.enableUpdateListener())
      // If few query show all summaries
      if (this.run.nbQueries() <= 5) {
        this.openedSummary = this.run.queries.map(q => q.path)
      }
    }
  },
  watch: {
    path () {
      this.setupResult()
    }
  },
  beforeMount () {
    this.setupResult()
  }
}
</script>

<template>
  <result-layout :result-object="query">

    <!-- Post Title -->
    <template slot="post-title" v-if="query.isCompleted()">
      <el-tag size="medium" effect="dark" class="query-result" :type="query.attackFound() ? 'danger' : 'success'">
        {{ query.shortResultDescription() }}
      </el-tag>
    </template>

    <!-- Actions -->
    <template slot="actions">
      <router-link :to="{name: 'start-run',
      params: { config: query.batch.computedOptions, files: [query.run.inputFileAbsolutePath()] }}">
        <el-button type="primary" size="small" icon="el-icon-refresh-right" plain>
          Restart Run
        </el-button>
      </router-link>
    </template>

    <!-- Summary -->
    <template slot="summary">
      <el-card>
        <span slot="header"><i class="el-icon-s-data"></i> Summary</span>
        <query-summary :query="query"></query-summary>
      </el-card>
    </template>

    <!-- Progression -->
    <template slot="progression">{{ progressionStepStr }}</template>

    <!-- Details -->
    <template slot="details">
      <el-tabs v-model="activeDetail">
        <!-- Processes -->
        <el-tab-pane label="Processes" name="processes" :lazy="true">
          <query-processes :query="query"></query-processes>
        </el-tab-pane>
        <template v-if="query.attackTrace">
          <!-- Display attack trace -->
          <el-tab-pane label="Attack Trace" name="trace" :lazy="true">
            <query-trace :query="query"></query-trace>
          </el-tab-pane>
        </template>
        <!-- Simulator -->
        <el-tab-pane label="Simulator" name="simulator" :lazy="true">
          TODO
        </el-tab-pane>
      </el-tabs>
    </template>
  </result-layout>
</template>

<script>
  import ResultLayout from '../components/results/ResultLayout'
  import QuerySummary from '../components/query/QuerySummary'
  import QueryTrace from '../components/query/QueryTrace'
  import QueryProcesses from '../components/query/QueryProcesses'

  export default {
    name: 'query',
    components: {
      QueryProcesses,
      QueryTrace,
      QuerySummary,
      ResultLayout
    },
    props: {
      query: Object
    },
    data () {
      return {
        activeDetail: 'processes'
      }
    },
    computed: {
      progressionStepStr: function () {
        if (this.query.status === 'completed') {
          return 'Done'
        }

        if (!this.query.progression) {
          return 'Not started'
        }

        const roundStr = this.query.progression.round === 0 ? '' : `Round ${this.query.progression.round} - `

        if (this.query.progression.generation) {
          return `${roundStr}Jobs generation
          (${this.query.progression.generation.jobs_created}/${this.query.progression.generation.minimum_jobs})`
        }

        if (this.query.progression.verification) {
          return `${roundStr}Verification processing
           (jobs remaining: ${this.query.progression.verification.jobs_remaining})`
        }
      }
    },
    beforeMount () {
      // If has attack trace auto switch to this tab
      if (this.query.attackTrace) {
        this.activeDetail = 'trace'
      }
    }
  }
</script>

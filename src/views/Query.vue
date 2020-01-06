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
        <template v-if="query.isCompleted()">
          <template v-if="query.attackFound()">
            <!-- Display attack trace -->
            <el-tab-pane label="Attack Trace" name="trace" :lazy="true">
              <display-trace :query="query"></display-trace>
            </el-tab-pane>
            <!-- Attack simulator -->
            <el-tab-pane v-if="query.type === 'trace_equiv' || query.type === 'trace_incl'" label="Attack Simulator" name="attack-sim" :lazy="true">
              <attack-sim :query="query"></attack-sim>
            </el-tab-pane>
          </template>
          <template v-else>
            <!-- Equivalence simulator -->
            <el-tab-pane v-if="query.type === 'trace_equiv' || query.type === 'trace_incl'" label="Equivalence Simulator" name="equivalence-sim" :lazy="true">
              <equivalence-sim :query="query"></equivalence-sim>
            </el-tab-pane>
          </template>
        </template>
      </el-tabs>
    </template>
  </result-layout>
</template>

<script>
import ResultLayout from '../components/results/ResultLayout'
import QuerySummary from '../components/query/QuerySummary'
import DisplayTrace from '../components/simulators/DisplayTrace'
import QueryProcesses from '../components/query/QueryProcesses'
import QueryModel from '../models/QueryModel'
import AttackSim from '../components/simulators/AttackSim'
import EquivalenceSim from '../components/simulators/EquivalenceSim'

export default {
  name: 'query',
  components: {
    EquivalenceSim,
    AttackSim,
    QueryProcesses,
    DisplayTrace,
    QuerySummary,
    ResultLayout
  },
  props: {
    path: String
  },
  data () {
    return {
      activeDetail: 'processes',
      query: undefined
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
    this.query = new QueryModel(this.path, true, true)

    // If has attack trace auto switch to this tab
    if (this.query.isCompleted() && this.query.attackFound()) {
      this.activeDetail = 'trace'
    }
  }
}
</script>

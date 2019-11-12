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
      <el-row type="flex" :gutter="10" justify="center">
        <el-col :span="12" v-for="(process, index) in processesStr">
          <h3>Process {{ index + 1 }}</h3>
          <spec-code :code="process"></spec-code>
        </el-col>
      </el-row>
    </template>
  </result-layout>
</template>

<script>
  import { formatProcess } from '../util/process-parser'
  import ResultLayout from '../components/results/ResultLayout'
  import QuerySummary from '../components/query/QuerySummary'
  import SpecCode from '../components/SpecCode'

  export default {
    name: 'query',
    components: {
      QuerySummary,
      SpecCode,
      ResultLayout
    },
    props: {
      query: Object
    },
    computed: {
      processesStr: function () {
        return this.query.processes.map(p => formatProcess(p, this.query.atomicData))
      },
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
    }
  }
</script>

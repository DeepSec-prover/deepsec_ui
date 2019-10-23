<template>
  <result-layout :result-object="query">
    <template slot="post-title">
      <el-tag size="medium" effect="dark" class="query-result" :type="query.attackFound() ? 'danger' : 'success'">
        {{ query.shortResultDescription() }}
      </el-tag>
    </template>
    <!-- Summary -->
    <template slot="summary">
      <el-card>
        <span slot="header"><i class="el-icon-s-data"></i> Summary</span>
        <query-summary :query="query"></query-summary>
      </el-card>
    </template>
    <!-- Details -->
    <template slot="details">
      <el-row type="flex" :gutter="10" justify="center">
        <el-col :lg="12" :xl="8" v-for="(process, index) in processesStr">
          <h3>Process {{ index + 1 }} </h3>
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
      }
    }
  }
</script>

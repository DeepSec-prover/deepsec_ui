<template>
  <el-table id="result-table" :data="batches" @row-click="rowClick" empty-text="No batch found in the result folder.">
    <el-table-column prop="status" label="Status">
      <template slot-scope="scope">
        <result-status :status="scope.row.status" tag></result-status>
      </template>
    </el-table-column>
    <el-table-column label="Date">
      <template slot-scope="scope">{{ scope.row.title() }}</template>
    </el-table-column>
    <el-table-column label="Nb Run">
      <template slot-scope="scope">
        {{ scope.row.nbRun() }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
  import ResultStatus from './ResultStatus'
  import { getBatches } from '../../util/results-loader'

  export default {
    name: 'results-table',
    components: {
      ResultStatus
    },
    data () {
      return {
        batches: []
      }
    },
    methods: {
      rowClick (batch, column, event) {
        this.$router.push({ name: 'batch', params: { 'path': batch.path } })
      }
    },
    beforeMount () {
      this.batches = getBatches()
    }
  }
</script>

<style>
  #result-table tbody tr {
    cursor: pointer;
  }
</style>

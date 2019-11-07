<template>
  <el-table id="result-table" :data="batches" @row-click="rowClick"
            empty-text="No batch found in the result folder.">
    <el-table-column label="Status">
      <template slot-scope="scope">
        <result-status :status="scope.row.status" tag></result-status>
        <span v-if="scope.row.debug" class="debug-logo">
          <el-tooltip content="Ran in debug mode">
            <el-tag size="small" type="danger"><i class="el-icon-view"></i></el-tag>
          </el-tooltip>
        </span>
      </template>
    </el-table-column>
    <el-table-column label="Title">
      <template slot-scope="scope">
        {{ scope.row.defaultTitle ? scope.row.defaultTitle : '-' }}
      </template>
    </el-table-column>
    <el-table-column label="Nb Run">
      <template slot-scope="scope">
        {{ scope.row.nbRun() }}
      </template>
    </el-table-column>
    <el-table-column label="Date">
      <template slot-scope="scope">
        <date :date="scope.row.startTime" strict></date>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
  import ResultStatus from './ResultStatus'
  import Date from '../Date'
  import { getBatches } from '../../util/results-loader'

  export default {
    name: 'results-table',
    components: {
      ResultStatus,
      Date
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

  .debug-logo {
    margin-left: 5px;
  }
</style>

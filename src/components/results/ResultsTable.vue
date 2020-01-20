<template>
  <data-tables-server id="result-table"
                      :data="pageBatches"
                      :total="totalBatches"
                      @row-click="rowClick"
                      empty-text="No batch found in the result folder."
                      :default-sort="{prop: 'startTime', order: 'descending'}"
                      :pagination-props="{ pageSizes: [5, 10, 15] }"
                      :page-size="10"
                      :loading="loading"
                      @query-change="loadData">
    <el-table-column label="Status"
                     prop="status"
                     :filters="statusValues"
                     :filter-method="filterStatus"
                     filter-placement="bottom-end">
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
    <el-table-column label="Date" prop="startTime" sortable>
      <template slot-scope="scope">
        <date :date="scope.row.startTime" strict></date>
      </template>
    </el-table-column>
  </data-tables-server>
</template>

<script>
import ResultStatus from './ResultStatus'
import Date from '../Date'
import { getBatches, getCountBatches } from '../../database/database-remote'

export default {
  name: 'results-table',
  components: {
    ResultStatus,
    Date
  },
  data () {
    return {
      pageBatches: [],
      totalBatches: 0,
      loading: true,
      statusValues: [
        { text: 'Completed', value: 'completed' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Canceled', value: 'canceled' },
        { text: 'Error', value: 'internal_error' }
      ]
    }
  },
  methods: {
    rowClick (batch, column, event) {
      this.$router.push({ name: 'batch', params: { 'path': batch.path } })
    },
    filterStatus (value, row) {
      return row.status === value
    },
    async loadData (queryInfo) {
      console.log(queryInfo)
      this.loading = true

      getBatches()
        .then(value => {
          this.pageBatches = value
          this.loading = false
        })

      getCountBatches()
        .then(value => {
          this.totalBatches = value
        })
    }
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

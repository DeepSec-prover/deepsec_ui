<template>
  <div>
    <!-- Filters -->
    <el-form class="centred-content" size="small" :inline="true" @submit.native.prevent>
      <!-- Filter title -->
      <el-form-item label="Title">
        <el-input v-model="filters[0].value"
                  prefix-icon="el-icon-search"
                  placeholder="Filter"
                  clearable></el-input>
      </el-form-item>
      <!-- Filter status -->
      <el-form-item label="Status">
        <el-select v-model="filters[1].value" multiple placeholder="Filter">
          <el-option
                  v-for="status in statusOptions"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <data-tables-server id="result-table"
                        :data="pageBatches"
                        :total="totalBatches"
                        @row-click="rowClick"
                        empty-text="No batch found in the result folder."
                        :table-props='{ defaultSort: {prop: "startTime", order: "descending"} }'
                        :pagination-props="{ pageSizes: [10, 15, 20, 25, 50] }"
                        :page-size="15"
                        :loading="loading"
                        :filters="filters"
                        @query-change="loadData"
                        @sort-condition="loadData">
      <el-table-column label="Status" prop="status">
        <template slot-scope="scope">
          <result-status :status="scope.row.status" tag></result-status>
          <span v-if="scope.row.debug" class="debug-logo">
          <el-tooltip content="Ran in debug mode">
            <el-tag size="small" type="danger"><i class="el-icon-view"></i></el-tag>
          </el-tooltip>
        </span>
        </template>
      </el-table-column>
      <el-table-column label="Title" prop="defaultTitle" sortable="custom">
        <template slot-scope="scope">
          {{ scope.row.defaultTitle ? scope.row.defaultTitle : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="Nb Run">
        <template slot-scope="scope">
          {{ scope.row.nbRun() }}
        </template>
      </el-table-column>
      <el-table-column label="Date" prop="startTime" sortable="custom">
        <template slot-scope="scope">
          <date :date="scope.row.startTime" strict></date>
        </template>
      </el-table-column>
    </data-tables-server>
  </div>
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
      filters: [
        {
          value: '',
          search_prop: 'title',
          type: 'text'
        },
        {
          value: [],
          search_prop: 'status',
          type: 'select'
        }],
      statusOptions: [
        { label: 'Completed', value: 'completed' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Error', value: 'internal_error' }
      ]
    }
  },
  methods: {
    rowClick (batch, column, event) {
      this.$router.push({ name: 'batch', params: { 'path': batch.path } })
    },
    async loadData (queryInfo) {
      console.log(queryInfo)
      this.loading = true

      getBatches(queryInfo.pageSize, queryInfo.page, queryInfo.sort, queryInfo.filters)
        .then(value => {
          this.pageBatches = value
          this.loading = false
        })

      getCountBatches(queryInfo.filters)
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

<template>
  <div>
    <h2>Results</h2>
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
  </div>
</template>

<script>
  import ResultStatus from '../components/results/ResultStatus'
  import userSettings from 'electron-settings'
  import fs from 'fs'
  import BatchModel from '../models/BatchModel'

  export default {
    name: 'all-results',
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
        console.log(batch.path)
        this.$router.push({ name: 'batch', params: { 'path': batch.path } })
      }
    },
    beforeMount () {
      fs.readdir(userSettings.get('resultsDirPath').toString(), (err, files) => {
        files.filter(file => file.endsWith('.json')).sort().reverse().forEach(file => this.batches.push(new BatchModel(file, false)))
      })
    }
  }
</script>

<style>
 #result-table tbody tr {
   cursor: pointer;
 }
</style>

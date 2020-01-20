<template>
  <div>
    <h2>Results</h2>
    <results-table></results-table>
  </div>
</template>

<script>
import ResultsTable from '../components/results/ResultsTable'
import { scanForInProgress } from '../database/database-remote'

export default {
  name: 'all-results',
  components: {
    ResultsTable
  },
  beforeCreate () {
    // Check in progress batches to be sure their status didn't change since the application start
    scanForInProgress()
  }
}
</script>


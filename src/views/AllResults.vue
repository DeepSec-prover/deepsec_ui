<template>
  <div>
    <h2>Results</h2>
    <results-table></results-table>
  </div>
</template>

<script>
  import ResultsTable from '../components/results/ResultsTable'

  export default {
    name: 'all-results',
    components: {
      ResultsTable
    },
  }
</script>


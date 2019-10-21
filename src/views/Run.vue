<template>
  <div>
    <!-- TODO breadcrumb -->

    <h2><i :class="[icons[run.status], run.status]"></i> Run {{ run.title() }} {{ text.status[run.status] }}</h2>

    <el-card>
      <div slot="header"><i class="el-icon-s-data"></i> Summary</div>
      <dl class="in-line">
        <dt>File</dt>
        <dd>{{ run.inputFileName() }}</dd> <!-- TODO open file link -->
        <dt>Nb query</dt>
        <dd>{{ run.nbQueries() }}</dd>
        <template v-if="run.startTime">
          <dt>Start time</dt>
          <dd>{{ run.startTime.toLocaleDateString() }} {{ run.startTime.toLocaleTimeString() }}</dd>
          <dt>Running time</dt>
          <dd>
            <duration :start-time="run.startTime" :end-time="run.endTime"></duration>
          </dd>
        </template>
      </dl>
    </el-card>

    <el-collapse id="query-list" v-model="openedSummary">
      <el-collapse-item v-for="(query, index) in run.queries" :name="query.path">
        <template slot="title">
          <h3>
            <i :class="[icons[run.status], run.status]"></i> Query {{ index + 1 }}
            <el-button size="small" class="open-query" @click="openQuery(query.path)">
              Details <i class="el-icon-top-right"></i>
            </el-button>
          </h3>
        </template>

        <query-summary :query="query"></query-summary>

      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
  import icons from '../text-content/icons'
  import text from '../text-content/text'
  import Duration from '../components/Duration'
  import QuerySummary from '../components/query/QuerySummary'

  export default {
    name: 'run',
    components: {
      Duration,
      QuerySummary
    },
    props: {
      run: Object
    },
    data () {
      return {
        icons: icons,
        text: text,
        openedSummary: []
      }
    },
    methods: {
      openQuery (path) {
        this.$router.push({ name: 'query', params: { 'path': path } })
      }
    },
    mounted () {
      // If few query show all summaries
      if (this.run.nbQueries() <= 5) {
        this.openedSummary = this.run.queries.map(q => q.path)
      }
    }
  }
</script>

<style scoped>
  #query-list {
    margin-top: 30px;
  }

  .open-query {
    margin-left: 15px;
  }
</style>

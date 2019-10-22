<template>
  <el-collapse-item :name="query.path">
    <template slot="title">
      <h3>
        <i :class="[icons[query.status], 'color-' + query.status]"></i> Query {{ query.index }}
        <el-tag size="small" class="query-result" :type="query.attackFound() ? 'danger' : 'success'">
          {{ query.shortResultDescription() }}
        </el-tag>
        <el-button size="mini" class="open-query" @click="openQuery(query.path)">
          Details <i class="el-icon-top-right"></i>
        </el-button>
      </h3>
    </template>
    <!-- Show error message if present -->
    <el-alert v-if="query.errorMsg" title="Error" type="error" :description="query.errorMsg" show-icon :closable="false"></el-alert>
    <!-- General information -->
    <el-row>
      <el-col :span="12">
        <dl class="in-line">
          <dt>Semantics</dt>
          <dd>
            <helper :helper-id="`semantics.${query.semantics}`" :text-content="true">{{ query.semantics }}</helper>
          </dd>
          <dt>Query type</dt>
          <dd>
            <helper :helper-id="`query.type.${query.type}`" :text-content="true">{{ text.query.type[query.type] }}</helper>
          </dd>
        </dl>
      </el-col>
      <el-col :span="12" v-if="query.startTime">
        <dl class="in-line">
          <dt>Start time</dt>
          <dd>{{ query.startTime.toLocaleDateString() }} {{ query.startTime.toLocaleTimeString() }}</dd>
          <dt>Running time</dt>
          <dd>
            <duration :start-time="query.startTime" :end-time="query.endTime"></duration>
          </dd>
        </dl>
      </el-col>
    </el-row>
  </el-collapse-item>
</template>

<script>
  import icons from '../../text-content/icons'
  import text from '../../text-content/text'
  import Helper from '../helpers/Helper'
  import Duration from '../Duration'

  export default {
    name: 'query-collapsible',
    components: {
      Helper,
      Duration
    },
    props: {
      query: Object
    },
    data () {
      return {
        icons: icons,
        text: text
      }
    },
    methods: {
      openQuery (path) {
        this.$router.push({ name: 'query', params: { 'path': path } })
      }
    }
  }
</script>

<style scoped>
  .open-query, .query-result {
    margin-left: 12px;
  }
</style>

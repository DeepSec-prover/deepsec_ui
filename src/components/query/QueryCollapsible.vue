<template>
  <el-collapse-item :name="query.path">
    <template slot="title">
      <h3>
        <result-status :status="query.status" tooltip></result-status>
        Query {{ query.index }}
        <el-tag v-if="query.isCompleted()" size="small" class="query-result" :type="query.attackFound() ? 'danger' : 'success'">
          {{ query.shortResultDescription() }}
        </el-tag>
        <el-button size="mini" class="open-query" @click="openQuery(query.path)">
          Details <i class="el-icon-top-right"></i>
        </el-button>
      </h3>
      <span v-if="query.isActive()" class="query-progress">
        &ndash;
        <template v-if="query.progression.round !== 0">Round {{ query.progression.round }} &ndash;</template>
        <template v-if="query.progression.generation">Generation </template>
        <template v-if="query.progression.verification">Verification </template>
        {{ query.progressionPercent() }}%
      </span>
    </template>
    <!-- Show error message if present -->
    <el-alert v-if="query.errorMsg" title="Error" type="error" :description="query.errorMsg" show-icon :closable="false"></el-alert>
    <!-- General information -->
    <el-row class="details">
      <el-col :sm="12">
        <dl class="in-line">
          <dt>Semantics</dt>
          <dd>
            <helper :helper-id="`semantics.${query.semantics}`" text-content>{{ query.semantics }}</helper>
          </dd>
          <dt>Query type</dt>
          <dd>
            <helper :helper-id="`query.type.${query.type}`" text-content>{{ text.query.type[query.type] }}</helper>
          </dd>
        </dl>
      </el-col>
      <el-col :sm="12" v-if="query.startTime">
        <dl class="in-line">
          <dt>Start time</dt>
          <dd>
            <date :date="query.startTime"></date>
          </dd>
          <template v-if="query.endTime">
            <dt>End time</dt>
            <dd>
              <date :date="query.endTime"></date>
            </dd>
          </template>
          <dt>Running time</dt>
          <dd>
            <duration :start-time="query.startTime" :end-time="query.endTime"></duration>
          </dd>
          <template v-if="query.maxMemory !== 0">
            <dt>Memory</dt>
            <dd>
              <memory :memory="query.maxMemory"></memory>
            </dd>
          </template>
        </dl>
      </el-col>
    </el-row>
  </el-collapse-item>
</template>

<script>
import text from '../../text-content/text'
import ResultStatus from '../results/ResultStatus'
import Date from '../Date'
import Memory from '../Memory'
import Helper from '../helpers/Helper'
import Duration from '../Duration'

export default {
  name: 'query-collapsible',
  components: {
    Helper,
    Date,
    Memory,
    Duration,
    ResultStatus
  },
  props: {
    query: Object
  },
  data () {
    return {
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

  .details dl {
    line-height: initial;
  }

  .query-progress {
    margin-left: 5px;
    color: #909399;
  }
</style>

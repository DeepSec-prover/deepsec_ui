<template>
  <result-layout :result-object="batch">
    <template slot="summary">
      <el-tabs type="border-card">
        <el-tab-pane>
          <span slot="label"><i class="el-icon-s-data"></i> Summary</span>
          <dl class="in-line">
            <dt>Nb run</dt>
            <dd>{{ batch.nbRun() }}</dd>
            <template v-if="batch.startTime">
              <dt>Start time</dt>
              <dd>{{ batch.startTime.toLocaleDateString() }} {{ batch.startTime.toLocaleTimeString() }}</dd>
              <dt>Running time</dt>
              <dd>
                <duration :start-time="batch.startTime" :end-time="batch.endTime"></duration>
              </dd>
            </template>
          </dl>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"><i class="el-icon-set-up"></i> Run Options</span>
        </el-tab-pane>
        <el-tab-pane>
          <span slot="label"><i class="el-icon-monitor"></i> DeepSec version</span>
          <dl class="in-line">
            <dt>Version</dt>
            <dd>{{ batch.deepsecVersion }}</dd>
            <dt>Git Branch</dt>
            <dd>
              <a :href="branchUrl" target="_blank" @click.prevent="openExternalBrowser">
                {{ batch.gitBranch }}
              </a>
            </dd>
            <dt>Git Hash</dt>
            <dd>
              <a :href="hashUrl" target="_blank" @click.prevent="openExternalBrowser">
                {{ batch.gitHash }}
              </a>
            </dd>
          </dl>
        </el-tab-pane>
      </el-tabs>
    </template>
    <template slot="details">
      <el-collapse>
        <el-collapse-item v-for="run in batch.runs">
          <template slot="title">
            <h3>
              <i :class="[icons[run.status], run.status]"></i> {{ run.title() }}
            </h3>
            <span class="run-info">
            {{ run.nbQueries() }} {{ run.nbQueries() > 1 ? 'queries' : 'query' }}
            &ndash;
            <duration :start-time="run.startTime" :end-time="run.endTime"></duration>
          </span>
          </template>
        </el-collapse-item>
      </el-collapse>
    </template>
  </result-layout>
</template>

<script>
  import icons from '../text-content/icons'
  import Duration from '../components/Duration'
  import ResultLayout from '../components/results/ResultLayout'
  import settings from '../../settings'
  import path from 'path'

  const { remote } = require('electron')

  export default {
    name: 'batch',
    components: {
      Duration,
      ResultLayout
    },
    props: {
      batch: Object
    },
    data () {
      return {
        icons: icons
      }
    },
    methods: {
      openExternalBrowser (e) {
        remote.shell.openExternal(e.target.href)
      }
    },
    computed: {
      branchUrl: function () {
        return path.join(settings.deepsecGitUrl, 'tree', this.batch.gitBranch)
      },
      hashUrl: function () {
        return path.join(settings.deepsecGitUrl, 'tree', this.batch.gitHash)
      }
    }
  }
</script>

<style scoped>
  dd > a {
    color: initial;
    text-decoration: initial;
  }

  dd > a:hover {
    text-decoration: underline;
  }

  .run-info {
    margin-left: 10px;
    color: #909399;
  }
</style>

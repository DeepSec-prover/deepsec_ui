<template>
  <result-layout :result-object="batch">

    <!-- Actions -->
    <template slot="actions">
      <router-link :to="{name: 'start-run',
      params: { config: batch.computedOptions, files: batch.inputFilesAbsolutePaths() }}">
        <el-button type="primary" size="small" icon="el-icon-refresh-right" plain>
          Restart Batch
        </el-button>
      </router-link>
      <el-button type="warning" size="small" icon="el-icon-close" plain
                 v-if="batch.isActive()" @click="cancelBatch">
        Cancel
      </el-button>
    </template>

    <!-- Summary -->
    <template slot="summary">
      <el-tabs type="border-card">
        <el-tab-pane>
          <span slot="label"><i class="el-icon-s-data"></i> Summary</span>
          <el-row>
            <el-col :md="12">
              <dl class="in-line">
                <dt>Local ID</dt>
                <dd>{{ batch.localId() }}</dd>
                <dt>Nb run</dt>
                <dd>{{ batch.nbRun() }}</dd>
                <template v-if="batch.debug">
                  <dt>Debug</dt>
                  <dd><el-tag size="mini" type="danger"><i class="el-icon-view"></i> yes</el-tag></dd>
                </template>
              </dl>
            </el-col>
            <el-col :md="12">
              <dl class="in-line">
                <dt>Start time</dt>
                <dd><date :date="batch.startTime"></date></dd>
                <template v-if="batch.endTime">
                  <dt>End time</dt>
                  <dd><date :date="batch.endTime"></date></dd>
                </template>
                <dt>Running time</dt>
                <dd>
                  <duration :start-time="batch.startTime" :end-time="batch.endTime"></duration>
                </dd>
              </dl>
            </el-col>
          </el-row>
        </el-tab-pane>
        <!-- Run Options -->
        <el-tab-pane>
          <span slot="label"><i class="el-icon-set-up"></i> Run Options</span>
          <run-config :user-config="batch.commandOptions" :computed-config="batch.computedOptions"></run-config>
        </el-tab-pane>
        <!-- Versions -->
        <el-tab-pane>
          <span slot="label"><i class="el-icon-monitor"></i> Versions</span>
          <el-row>
            <el-col :lg="9">
              <dl class="in-line">
                <dt>DeepSec Version</dt>
                <dd>{{ batch.deepsecVersion }}<span v-if="batch.debug"> (debug)</span></dd>
                <dt>OCaml Version</dt>
                <dd>{{ batch.ocamlVersion }}</dd>
              </dl>
            </el-col>
            <el-col :lg="15">
              <dl class="in-line">
                <dt>Git Branch</dt>
                <dd>
                  <template v-if="batch.gitBranch.includes('HEAD detached')">
                    {{ batch.gitBranch }} <!-- No link if detached -->
                  </template>
                  <template v-else>
                    <a :href="branchUrl" target="_blank" @click.prevent="$openExternalLink">
                      {{ batch.gitBranch }}
                    </a>
                  </template>
                </dd>
                <dt>Git Hash</dt>
                <dd>
                  <a :href="hashUrl" target="_blank" @click.prevent="$openExternalLink">
                    {{ batch.gitHash }}
                  </a>
                </dd>
              </dl>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </template>

    <!-- Progression -->
    <template slot="progression">
      Runs completed : {{batch.nbRunCompleted()}}/{{batch.nbRun()}}
    </template>

    <!-- Details -->
    <template slot="details">
      <el-collapse v-model="openedRun">
        <el-collapse-item v-for="run in batch.runs"
                          :class="['colored-header', 'colored-header-' + run.status]"
                          :name="run.path">
          <template slot="title">
            <h3>
              <result-status :status="run.status" tooltip></result-status>
              {{ run.title() }}
            </h3>
            <span class="run-info">
            {{ run.nbQueries() }} {{ run.nbQueries() > 1 ? 'queries' : 'query' }}
            &ndash;
            <duration :start-time="run.startTime" :end-time="run.endTime"></duration>
          </span>
          </template>
          <el-collapse>
            <query-collapsible v-for="query in run.queries" :query="query"></query-collapsible>
          </el-collapse>
        </el-collapse-item>
      </el-collapse>
    </template>
  </result-layout>
</template>

<script>
  import { ipcRenderer } from 'electron'
  import ResultStatus from '../components/results/ResultStatus'
  import Duration from '../components/Duration'
  import ResultLayout from '../components/results/ResultLayout'
  import QueryCollapsible from '../components/query/QueryCollapsible'
  import RunConfig from '../components/RunConfig'
  import Date from '../components/Date'
  import settings from '../../settings'
  import path from 'path'

  export default {
    name: 'batch',
    components: {
      Duration,
      ResultLayout,
      QueryCollapsible,
      ResultStatus,
      RunConfig,
      Date
    },
    props: {
      batch: Object
    },
    data () {
      return {
        openedRun: []
      }
    },
    computed: {
      branchUrl: function () {
        return path.join(settings.deepsecGitUrl, 'tree', this.batch.gitBranch)
      },
      hashUrl: function () {
        return path.join(settings.deepsecGitUrl, 'tree', this.batch.gitHash)
      }
    },
    methods: {
      cancelBatch () {
        ipcRenderer.send(`deepsec-api:start-run:${this.batch.path}:cancel-batch`)
      }
    },
    beforeMount () {
      this.batch.runs.forEach(r => r.loadQueries())

      if (this.batch.nbRun() === 1) {
        this.openedRun.push(this.batch.runs[0].path)
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

<style>
  .colored-header > div > .el-collapse-item__header {
    padding-left: 5px;
  }

  .colored-header > div > .el-collapse-item__content {
    margin-left: 30px;
    margin-right: 30px;
  }

  .colored-header-completed > div > .el-collapse-item__header {
    background-color: rgba(103, 194, 58, 0.1);
  }

  .colored-header-waiting > div > .el-collapse-item__header {
    background-color: rgba(144, 147, 153, 0.1);
  }

  .colored-header-internal_error > div > .el-collapse-item__header {
    background-color: rgba(245, 108, 108, 0.1);
  }

  .colored-header-canceled > div > .el-collapse-item__header {
    background-color: rgba(230, 162, 60, 0.1);
  }

  .colored-header-in_progress > div > .el-collapse-item__header {
    background-color: rgba(64, 158, 255, 0.1);
  }
</style>

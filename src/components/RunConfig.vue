<template>
  <div>
    <el-row>
      <el-col :md="12">
        <dl class="in-line">
          <dt>Default Semantic</dt>
          <dd>
            <helper :helper-id="`semantics.${userConfig.defaultSemantic}`" text-content>
              {{ userConfig.defaultSemantic }}
            </helper>
          </dd>
          <dt>Title</dt>
          <dd>
            {{ userConfig.title ? `"${userConfig.title}"` : '-' }}
            <span class="computed-conf" v-if="computedConfig && userConfig.title !== computedConfig.title">
              (<helper helper-str="Value computed during the run"
                       text-content>{{ `"${computedConfig.title}"` }}</helper>)
            </span>
          </dd>
          <dt>POR</dt>
          <dd>
            <helper :helper-id="`runOptions.por`" text-content>
              {{ userConfig.porStr() }}
            </helper>
          </dd>
        </dl>
      </el-col>
      <el-col :md="12" v-if="isDistributed">
        <dl class="in-line">
          <dt>Distributed</dt>
          <dd>
            <helper :helper-id="`runOptions.distributed.${userConfig.distributed}`" text-content>
              {{ userConfig.distributedStr() }}
            </helper>
            <span class="computed-conf" v-if="userConfig.distributed === 'auto' && computedConfig">
              (<helper helper-str="Value computed during the run"
                       :helper-id="`runOptions.distributed.${computedConfig.distributed}`"
                       text-content>{{ computedConfig.distributedStr() }}</helper>)
            </span>
          </dd>
          <dt>Number of Jobs</dt>
          <dd>
            {{ userConfig.nbJobsStr() }}
            <span class="computed-conf" v-if="userConfig.nbJobs.auto && computedConfig">
              (<helper helper-str="Value computed during the run"
                       text-content>{{ computedConfig.nbJobsStr() }}</helper>)
            </span>
          </dd>
          <dt>Local Workers</dt>
          <dd>
            {{ userConfig.localWorkersStr() }}
            <span class="computed-conf" v-if="userConfig.localWorkers.auto && computedConfig">
              (<helper helper-str="Value computed during the run"
                       text-content>{{ computedConfig.localWorkersStr() }}</helper>)
            </span>
          </dd>
          <dt>Round Timer</dt>
          <dd>
            <duration :duration="userConfig.roundTimer"></duration>
          </dd>
        </dl>
      </el-col>
    </el-row>
    <template v-if="isDistributed && nbServer > 0">
      <el-divider></el-divider>
      <!-- Summary of servers -->
      <el-row>
        {{ nbDistantWorkers }} distant worker{{ nbDistantWorkers > 1 ? 's' : '' }}
        in {{ nbServer }} server{{ nbServer > 1 ? 's' : '' }}
      </el-row>
      <!-- Servers listing -->
      <el-row>
        <!-- The guy who decide to start the "for i in range" from 1 deserve to burn in hell -->
        <el-col :sm="12" :lg="6" v-for="i in nbServer">
          <dl class="in-line">
            <dt>Host</dt>
            <dd>{{ userConfig.servers[i - 1].host }}</dd>
            <dt>Path</dt>
            <dd>{{ userConfig.servers[i - 1].path }}</dd>
            <dt>Workers</dt>
            <dd>
              {{ userConfig.servers[i - 1].workersStr() }}
              <span class="computed-conf" v-if="userConfig.servers[i - 1].workers.auto && computedConfig">
                (<helper helper-str="Value computed during the run"
                         text-content>{{ computedConfig.servers[i - 1].workersStr() }}</helper>)
              </span>
            </dd>
          </dl>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script>
  import Helper from './helpers/Helper'
  import Duration from './Duration'

  export default {
    name: 'run-config',
    components: {
      Helper,
      Duration
    },
    props: {
      userConfig: {
        type: Object
      },
      computedConfig: {
        type: Object,
        default: null
      }
    },
    computed: {
      isDistributed: function () {
        if (this.computedConfig) {
          return this.computedConfig.distributed === true
        } else {
          return this.userConfig.distributed !== 'no'
        }
      },
      nbServer: function () {
        return this.userConfig.servers.length
      },
      nbDistantWorkers: function () {
        return this.computedConfig.nbDistantWorkers()
      }
    }
  }
</script>

<style scoped>
  .computed-conf {
    color: #909399;
  }
</style>

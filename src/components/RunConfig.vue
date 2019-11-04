<template>
  <div>
    <el-row>
      <el-col :lg="12">
        <dl class="in-line">
          <dt>Default Semantic</dt>
          <dd>
            <helper :helper-id="`semantics.${userConfig.defaultSemantic}`" text-content>
              {{ userConfig.defaultSemantic }}
            </helper>
          </dd>
          <dt>Distributed</dt>
          <dd>
            <helper :helper-id="`runOptions.distributed.${userConfig.distributed}`" text-content>
              {{ userConfig.distributed }}
            </helper>
            <span class="computed-conf" v-if="userConfig.distributed === 'auto' && computedConfig">
              ({{ computedConfig.distributed }})
            </span>
          </dd>
          <dt>POR</dt>
          <dd>
            <helper :helper-id="`runOptions.por`" text-content>
              {{ userConfig.por ? 'yes' : 'no' }}
            </helper>
          </dd>
        </dl>
      </el-col>
      <el-col :lg="12" v-if="isDistributed">
        <dl class="in-line">
          <dt>Number of Jobs</dt>
          <dd>
            {{ userConfig.nbJobs.auto ? 'auto' : userConfig.nbJobs.value }}
            <span class="computed-conf" v-if="userConfig.nbJobs.auto && computedConfig">
              ({{ computedConfig.nbJobs.value }})
            </span>
          </dd>
          <dt>Local Workers</dt>
          <dd>
            {{ userConfig.localWorkers.auto ? 'auto' : userConfig.localWorkers.value }}
            <span class="computed-conf" v-if="userConfig.localWorkers.auto && computedConfig">
              ({{ computedConfig.localWorkers.value }})
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
        <el-col :sm="12" :lg="6" v-for="i in nbServer">
          <dl>
            <dt>Host</dt>
            <dd>{{ userConfig.servers[i].host }}</dd>
            <dt>Path</dt>
            <dd>{{ userConfig.servers[i].path }}</dd>
            <dt>Workers</dt>
            <dd>
              {{ userConfig.servers[i].workers.auto ? 'auto' : userConfig.servers[i].workers.value }}
              <span class="computed-conf" v-if="userConfig.servers[i].workers.auto && computedConfig">
                ({{ computedConfig.servers[i].workers.value }})
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
          return this.computedConfig.distributed === 'yes'
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

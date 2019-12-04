<template>
  <div>
    <el-row>
      <el-col :md="12">
        <dl class="in-line">
          <!-- Default Semantic -->
          <dt>Default Semantic</dt>
          <dd>
            <helper v-if="userConfig.defaultSemantic" :helper-id="`semantics.${userConfig.defaultSemantic}`" text-content>
              {{ userConfig.defaultSemantic }}
            </helper>
            <template v-else>-</template>
            <span v-if="userConfig.defaultSemantic !== computedConfig.defaultSemantic" class="computed-conf">
              (<helper helper-str="Value computed during the run." :helper-id="`semantics.${computedConfig.defaultSemantic}`"
                       text-content>{{ computedConfig.defaultSemantic }}</helper>)
            </span>
          </dd>
          <!-- Title -->
          <dt>Title</dt>
          <dd>
            {{ userConfig.title === undefined ? '-' : `"${userConfig.title}"` }}
            <span class="computed-conf" v-if="userConfig.title !== computedConfig.title">
              (<helper helper-str="Value computed during the run."
                       text-content>{{ `"${computedConfig.title}"` }}</helper>)
            </span>
          </dd>
          <!-- POR -->
          <dt>POR</dt>
          <dd>
            <helper helper-id="runOptions.por" text-content>
              {{ userPorStr }}
            </helper>
            <span class="computed-conf" v-if="userConfig.por !== computedConfig.por">
              (<helper helper-str="Value computed during the run." helper-id="runOptions.por"
                       text-content>{{ computedConfig.por ? 'yes' : 'no' }}</helper>)
            </span>
          </dd>
          <!-- Distributed -->
          <dt>Distributed</dt>
          <dd>
            <helper v-if="userConfig.distributed !== undefined" :helper-id="`runOptions.distributed.${userConfig.distributed}`" text-content>
              {{ userDistributedStr }}
            </helper>
            <template v-else>-</template>
            <span class="computed-conf" v-if="userConfig.distributed !== computedConfig.distributed">
              (<helper helper-str="Value computed during the run."
                       :helper-id="`runOptions.distributed.${computedConfig.distributed}`"
                       text-content>{{ computedConfig.distributed ? 'yes' : 'no' }}</helper>)
            </span>
          </dd>
        </dl>
      </el-col>
      <el-col :md="12" v-if="isDistributed">
        <dl class="in-line">
          <!-- Nb Jobs -->
          <dt>Number of Jobs</dt>
          <dd>
            {{ autoOrInt(userConfig.nbJobs) }}
            <span class="computed-conf" v-if="!userConfig.nbJobs || userConfig.nbJobs.auto ||
             userConfig.nbJobs.value !== computedConfig.nbJobs.value">
              (<helper helper-str="Value computed during the run."
                       text-content>{{ computedConfig.nbJobs.value }}</helper>)
            </span>
          </dd>
          <!-- Local Workers -->
          <dt>Local Workers</dt>
          <dd>
            {{ autoOrInt(userConfig.localWorkers) }}
            <span class="computed-conf" v-if="!userConfig.localWorkers || userConfig.localWorkers.auto ||
             userConfig.localWorkers.value !== computedConfig.localWorkers.value">
              (<helper helper-str="Value computed during the run."
                       text-content>{{ computedConfig.localWorkers.value }}</helper>)
            </span>
          </dd>
          <!-- Round Timer -->
          <dt>Round Timer</dt>
          <dd>
            <duration v-if="userConfig.roundTimer" :duration="userConfig.roundTimer"></duration>
            <template v-else>
              -
              <span class="computed-conf">
              (<helper helper-str="Value computed during the run.">
                <duration :duration="computedConfig.roundTimer"></duration>
              </helper>)
            </span>
            </template>
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
              {{ autoOrInt(userConfig.servers[i - 1].workers) }}
              <span class="computed-conf" v-if="!userConfig.servers[i - 1].workers ||
              userConfig.servers[i - 1].workers.auto ||
              userConfig.servers[i - 1].workers.value !== computedConfig.servers[i - 1].workers.value">
                (<helper helper-str="Value computed during the run."
                         text-content>{{ computedConfig.servers[i - 1].workers.value }}</helper>)
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
      type: Object
    }
  },
  methods: {
    autoOrInt (object) {
      // null or undefined
      if (!object) {
        return '-'
      }

      if (object.auto) {
        return 'auto'
      }

      return object.value.toString()
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
    },
    /**
     * @returns {string} The printable distributed value
     */
    userDistributedStr: function () {
      if (this.userConfig.distributed === 'auto') {
        return 'auto'
      }

      if (this.userConfig.distributed === true) {
        return 'yes'
      }

      if (this.userConfig.distributed === false) {
        return 'no'
      }

      // null or undefined
      return '-'
    },
    /**
     * @returns {string} The printable POR value
     */
    userPorStr: function () {
      // null or undefined
      if (this.userConfig.por === null || this.userConfig.por === undefined) {
        return '-'
      }

      return this.userConfig.por ? 'yes' : 'no'
    }
  }
}
</script>

<style scoped>
  .computed-conf {
    color: #909399;
  }
</style>

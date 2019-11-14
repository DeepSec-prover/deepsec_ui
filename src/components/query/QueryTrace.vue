<template>
  <el-row :gutter="20">
    <el-col :md="16">
      <h3>Attack on Process {{ queryTrace.query.attackTrace.index_process + 1 }}</h3>
      <spec-code :code="processStr"></spec-code>
    </el-col>
    <el-col :md="8">

      <!-- Trace level selection -->
      <el-radio-group v-model="traceLevel">
        <helper helper-id="traceLevel.default">
          <el-radio-button label="default">Default</el-radio-button>
        </helper>
        <helper helper-id="traceLevel.io">
          <el-radio-button label="io">IO</el-radio-button>
        </helper>
        <helper helper-id="traceLevel.all">
          <el-radio-button label="all">All</el-radio-button>
        </helper>
      </el-radio-group>
      <br>

      <!-- Navigation buttons -->
      <el-button-group>
        <el-button :disabled="!queryTrace.hasPreviousAction(traceLevel)"
                   @click="queryTrace.previousAction(traceLevel)"
                   icon="el-icon-arrow-left">
          Prev
        </el-button>
        <el-button :disabled="!queryTrace.hasNextAction(traceLevel)"
                   @click="queryTrace.nextAction(traceLevel)">
          Next
          <i class="el-icon-arrow-right"></i>
        </el-button>
      </el-button-group>

      <el-card>
        <template slot="header">
          Trace{{ queryTrace.currentAction === -1 ? '' : ` - Step n°${queryTrace.currentAction + 1}` }}
        </template>
        <div v-if="queryTrace.currentAction === -1" class="centred-content info-text">
          Initial step
        </div>
        <div v-else-if="noActionVisible" class="centred-content info-text">
          Nothing visible at this level
        </div>
        <ol v-else>
          <li v-for="i in queryTrace.actions.length" v-if="visibleActions[i-1]">
            <spec-code in-line :code="actionsStr[i-1]"></spec-code>
          </li>
        </ol>
      </el-card>
      <h3>Frame</h3>
    </el-col>
  </el-row>
</template>

<script>
  import QueryModel from '../../models/QueryModel'
  import QueryTraceModel from '../../models/QueryTraceModel'
  import Helper from '../helpers/Helper'
  import SpecCode from '../SpecCode'
  import { formatAction, formatProcess } from '../../util/process-parser'

  export default {
    name: 'query-trace',
    components: {
      SpecCode,
      Helper
    },
    props: {
      query: {
        type: QueryModel
      }
    },
    data () {
      return {
        queryTrace: null,
        traceLevel: 'default', // default or io or full
        visibleActions: [],
        noActionVisible: true
      }
    },
    computed: {
      processStr: function () {
        return formatProcess(this.queryTrace.process, this.query.atomicData)
      },
      actionsStr: function () {
        let axiomIdRef = { value: 1 }
        let actionsStr = []

        // Format all actions
        this.queryTrace.actions.forEach(a => {
          actionsStr.push(formatAction(a, this.queryTrace.atomic, axiomIdRef))
        })

        return actionsStr
      }
    },
    methods: {
      /**
       * Filter action by visibility status.
       * An action is not visible if it hasn't been executed yet or if it isn't in the scope of the
       * current trace level.
       *
       * @returns {[Boolean]} An array of boolean where every position match with an action of the trace.
       */
      computeVisibleActions () {
        let actions = []
        let oneActionVisible = false
        let currentAction

        for (let i = 0; i < this.queryTrace.actions.length; i++) {
          let a = this.queryTrace.actions[i]
          if (i > this.queryTrace.currentAction) {
            currentAction = false
          } else
          {
            switch (this.traceLevel) {
              case 'default':
                currentAction = a.type === 'output' || a.type === 'input' || a.type === 'eavesdrop'
                break
              case 'io':
                currentAction = a.type === 'output' || a.type === 'input' || a.type === 'eavesdrop'
                break
              case 'all':
                currentAction = true
                break
            }
          }

          actions.push(currentAction)
          oneActionVisible = oneActionVisible || currentAction
        }

        // Set at the end to avoid multiple update
        this.noActionVisible = !oneActionVisible
        this.visibleActions = actions
      },
    },
    watch : {
      // Manual trigger visible actions because computed method fail to detect changes.
      traceLevel: function () {
        this.computeVisibleActions()
      },
      'queryTrace.currentAction': function () {
        this.computeVisibleActions()
      }
    },
    beforeMount () {
      this.queryTrace = new QueryTraceModel(this.query)
      this.computeVisibleActions()
    }
  }
</script>

<style scoped>
  .info-text {
    font-style: italic;
    color: #909399;
  }
</style>

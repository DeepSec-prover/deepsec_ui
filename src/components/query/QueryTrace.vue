<template>
  <el-row :gutter="20">
    <el-col :md="16">
      <h3>Attack on Process {{ queryTrace.query.attackTrace.index_process + 1 }}</h3>
      <spec-code :code="processStr"></spec-code>
    </el-col>
    <el-col :md="8">

      <div id="trace-buttons" class="centred-content">
        <!-- Trace level selection -->
        <el-radio-group v-model="traceLevel">
          <helper helper-id="traceLevel.default">
            <el-radio-button label="default">Default</el-radio-button>
          </helper>
          <helper helper-id="traceLevel.io">
            <el-radio-button label="io">I/O</el-radio-button>
          </helper>
          <helper helper-id="traceLevel.all">
            <el-radio-button label="all">All</el-radio-button>
          </helper>
        </el-radio-group>
        <br>

        <!-- Navigation buttons -->
        <el-button-group>
          <el-button :disabled="queryTrace.loading || !queryTrace.hasPreviousAction()"
                     @click="firstAction"
                     icon="el-icon-d-arrow-left"
                     v-shortkey="['ctrl', 'arrowleft']" @shortkey.native="firstAction">
          </el-button>
          <el-button :disabled="queryTrace.loading || !queryTrace.hasPreviousAction()"
                     @click="previousAction"
                     icon="el-icon-arrow-left"
                     v-shortkey="['arrowleft']" @shortkey.native="previousAction">
            Prev
          </el-button>
          <el-button :disabled="queryTrace.loading || !queryTrace.hasNextAction()"
                     @click="nextAction"
                     v-shortkey="['arrowright']" @shortkey.native="nextAction">
            Next
            <i class="el-icon-arrow-right"></i>
          </el-button>
          <el-button :disabled="queryTrace.loading || !queryTrace.hasNextAction()"
                     @click="lastAction"
                     v-shortkey="['ctrl', 'arrowright']" @shortkey.native="lastAction">
            <i class="el-icon-d-arrow-right"></i>
          </el-button>
        </el-button-group>
      </div>

      <!-- Trace actions -->
      <el-card class="steps-frame">
        <template slot="header">
          <template v-if="queryTrace.currentAction === -1">
            Trace - {{ queryTrace.nbSteps() }} Step{{ queryTrace.nbSteps() > 1 ? 's' : '' }}
          </template>
          <template v-else>
            Trace - Step {{ queryTrace.currentAction + 1 }} / {{ queryTrace.nbSteps() }}
          </template>
        </template>
        <div v-if="queryTrace.currentAction === -1" class="centred-content info-text">
          Initial state
        </div>
        <div v-else-if="noActionVisible" class="centred-content info-text">
          Nothing visible with this detail level
        </div>
        <simplebar v-else id="steps">
          <div id="trace-actions">
            <template v-for="i in queryTrace.actions.length" v-if="visibleActions[i-1]">
              <span class="action-index">{{ i }}</span>
              <span class="action-description">
                <spec-code in-line :code="actionsStr[i-1]"
                           @click.native="queryTrace.gotoAction(i-1)"
                           :class="{'clickable': true, 'tau': isTauAction(queryTrace.actions[i-1])}"></spec-code>
              </span>
            </template>
          </div>
        </simplebar>
      </el-card>

      <!-- Trace Frame -->
      <el-card header="Frame">
        <ul>
          <li v-for="i in queryTrace.frame.length">
            ax<sub>{{i}}</sub>
            <spec-code in-line :code="'TODO'"></spec-code>
          </li>
        </ul>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
  import QueryModel from '../../models/QueryModel'
  import QueryTraceModel from '../../models/QueryTraceModel'
  import Simplebar from 'simplebar-vue'
  import Helper from '../helpers/Helper'
  import SpecCode from '../SpecCode'
  import { formatAction, formatProcess } from '../../util/process-parser'
  import logger from 'electron-log'

  export default {
    name: 'query-trace',
    components: {
      SpecCode,
      Helper,
      Simplebar
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
        if (!this.queryTrace.process)
          return 'loading ...'

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
          } else {
            currentAction = QueryTraceModel.isVisibleAction(a, this.traceLevel)
          }

          actions.push(currentAction)
          oneActionVisible = oneActionVisible || currentAction
        }

        // Set at the end to avoid multiple update
        this.noActionVisible = !oneActionVisible
        this.visibleActions = actions
      },
      isTauAction (action) {
        return ['tau', 'comm', 'bang', 'choice'].includes(action.type)
      },
      firstAction () {
        if (!this.queryTrace.loading && this.queryTrace.hasPreviousAction()) {
          this.queryTrace.gotoFirstAction()
        } else {
          logger.debug('Go to first action method call to fast (still loading)')
        }
      },
      previousAction () {
        if (!this.queryTrace.loading && this.queryTrace.hasPreviousAction()) {
          this.queryTrace.previousAction(this.traceLevel)
        } else {
          logger.debug('Go to previous action method call to fast (still loading)')
        }
      },
      nextAction () {
        if (!this.queryTrace.loading && this.queryTrace.hasNextAction()) {
          this.queryTrace.nextAction(this.traceLevel)
        } else {
          logger.debug('Go to next action method call to fast (still loading)')
        }
      },
      lastAction () {
        if (!this.queryTrace.loading && this.queryTrace.hasNextAction()) {
          this.queryTrace.gotoLastAction()
        } else {
          logger.debug('Go to last action method call to fast (still loading)')
        }
      }
    },
    watch: {
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
      this.queryTrace.start()
      this.computeVisibleActions()
    }
  }
</script>

<style scoped>
  .info-text {
    font-style: italic;
    color: #909399;
  }

  #trace-actions {
    list-style-type: none;
    display: grid;
    grid-template-columns: minmax(40px, max-content) 1fr
  }

  #trace-actions .action-index {
    text-align: right;
    margin-right: 5px;
    color: #909399;
    align-self: center;
  }

  #trace-actions .action-index:after {
    content: " - ";
  }

  #trace-buttons > * {
    margin-bottom: 15px;
  }

  #trace-buttons {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .tau {
    opacity: 0.5;
  }

  #steps {
    max-height: 50vh;
  }

  .steps-frame {
    margin-bottom: 20px;
  }
</style>

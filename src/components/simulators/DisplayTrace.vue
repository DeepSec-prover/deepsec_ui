<template>
  <el-row :gutter="10">
    <el-col :md="16">
      <h3>Attack on Process {{ queryTrace.query.attackTrace.index_process }}</h3>
      <spec-code :code="processStr"></spec-code>
    </el-col>
    <el-col :md="8">

      <div id="trace-buttons" class="centred-content">
        <!-- Trace level selection -->
        <el-radio-group v-model="traceLevel" size="small">
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
          <helper helper-str="Go to initial state.<br><b>Short Key</b> : ctrl + ⇦">
            <el-button :disabled="queryTrace.loading || !queryTrace.hasPreviousAction()"
                       @click="firstAction"
                       icon="el-icon-d-arrow-left"
                       v-shortkey="['ctrl', 'arrowleft']" @shortkey.native="firstAction">
            </el-button>
          </helper>
          <helper helper-str="Go to previous action.<br><b>Short Key</b> : ⇦">
            <el-button :disabled="queryTrace.loading || !queryTrace.hasPreviousAction()"
                       @click="previousAction"
                       icon="el-icon-arrow-left"
                       v-shortkey="['arrowleft']" @shortkey.native="previousAction">
              Prev
            </el-button>
          </helper>
          <helper helper-str="Go to next action.<br><b>Short Key</b> : ⇨">
            <el-button :disabled="queryTrace.loading || !queryTrace.hasNextAction()"
                       @click="nextAction"
                       v-shortkey="['arrowright']" @shortkey.native="nextAction">
              Next
              <i class="el-icon-arrow-right"></i>
            </el-button>
          </helper>
          <helper helper-str="Go to last action.<br><b>Short Key</b> : ctrl + ⇨">
            <el-button :disabled="queryTrace.loading || !queryTrace.hasNextAction()"
                       @click="lastAction"
                       v-shortkey="['ctrl', 'arrowright']" @shortkey.native="lastAction">
              <i class="el-icon-d-arrow-right"></i>
            </el-button>
          </helper>
        </el-button-group>
      </div>

      <!-- Trace actions -->
      <sim-trace :actions="queryTrace.actions"
                 :atomic="queryTrace.atomic"
                 :current-action="queryTrace.currentAction"
                 :trace-level="traceLevel"
                 determinate
                 v-on:goto="gotoAction"></sim-trace>

      <!-- Trace Frame -->
      <sim-frame :frame="queryTrace.frame" :atomic="queryTrace.atomic"></sim-frame>
    </el-col>
  </el-row>
</template>

<script>
  import QueryModel from '../../models/QueryModel'
  import DisplayTraceModel from '../../models/DisplayTraceModel'
  import Simplebar from 'simplebar-vue'
  import Helper from '../helpers/Helper'
  import SpecCode from '../SpecCode'
  import { formatProcess } from '../../util/process-parser'
  import logger from 'electron-log'
  import SimFrame from './SimFrame'
  import SimTrace from './SimTrace'

  export default {
    name: 'query-trace',
    components: {
      SimTrace,
      SimFrame,
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

        return formatProcess(this.queryTrace.process, this.queryTrace.atomic)
      }
    },
    methods: {
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
      },
      gotoAction (id) {
        if (!this.queryTrace.loading) {
          this.queryTrace.gotoAction(id)
        } else {
          logger.debug('Go to action method call to fast (still loading)')
        }
      }
    },
    beforeMount () {
      // Create the model but don't start the API util the first call.
      this.queryTrace = new DisplayTraceModel(this.query)
    },
    // Called when the user change to an other view.
    destroyed () {
      // Stop the display trace process
      this.queryTrace.stop()
    }
  }
</script>

<style scoped>
  #trace-buttons > * {
    margin-bottom: 15px;
  }

  #trace-buttons {
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>

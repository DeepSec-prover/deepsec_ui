<template>
  <el-row :gutter="10">
    <el-col :md="16">
      <h3>Attack on Process {{ processDisplayed.processId }}</h3>
      <spec-code :code="processStr"></spec-code>
    </el-col>
    <el-col :md="8">

      <div id="trace-buttons" class="centred-content">
        <!-- Trace level selection -->
        <el-radio-group v-model="processDisplayed.traceLevel" size="small">
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
            <el-button :disabled="processDisplayed.loading || !processDisplayed.hasPreviousAction()"
                       @click="firstAction"
                       icon="el-icon-d-arrow-left"
                       v-shortkey="['ctrl', 'arrowleft']" @shortkey.native="firstAction">
            </el-button>
          </helper>
          <helper helper-str="Go to previous action.<br><b>Short Key</b> : ⇦">
            <el-button :disabled="processDisplayed.loading || !processDisplayed.hasPreviousAction()"
                       @click="previousAction"
                       icon="el-icon-arrow-left"
                       v-shortkey="['arrowleft']" @shortkey.native="previousAction">
              Prev
            </el-button>
          </helper>
          <helper helper-str="Go to next action.<br><b>Short Key</b> : ⇨">
            <el-button :disabled="processDisplayed.loading || !processDisplayed.hasNextAction()"
                       @click="nextAction"
                       v-shortkey="['arrowright']" @shortkey.native="nextAction">
              Next
              <i class="el-icon-arrow-right"></i>
            </el-button>
          </helper>
          <helper helper-str="Go to last action.<br><b>Short Key</b> : ctrl + ⇨">
            <el-button :disabled="processDisplayed.loading || !processDisplayed.hasNextAction()"
                       @click="lastAction"
                       v-shortkey="['ctrl', 'arrowright']" @shortkey.native="lastAction">
              <i class="el-icon-d-arrow-right"></i>
            </el-button>
          </helper>
        </el-button-group>
      </div>

      <!-- Trace actions -->
      <sim-trace :actions="processDisplayed.actions"
                 :atomic="processDisplayed.atomic"
                 :current-action="processDisplayed.currentAction"
                 :trace-level="processDisplayed.traceLevel"
                 determinate
                 v-on:goto="gotoAction"></sim-trace>

      <!-- Trace Frame -->
      <sim-frame :frame="processDisplayed.frame" :atomic="processDisplayed.atomic"></sim-frame>
    </el-col>
  </el-row>
</template>

<script>
import QueryModel from '../../models/QueryModel'
import Simplebar from 'simplebar-vue'
import Helper from '../helpers/Helper'
import SpecCode from '../SpecCode'
import { formatProcess } from '../../util/process-parser'
import logger from 'electron-log'
import SimFrame from './SimFrame'
import SimTrace from './SimTrace'
import ProcessDisplayedModel from '../../models/ProcessDisplayedModel'
import ApiRemote from '../../deepsec-api/ApiRemote'

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
        processDisplayed: undefined,
        apiRemote: undefined,
        visibleActions: [],
        noActionVisible: true
      }
    },
    computed: {
      processStr: function () {
        if (!this.processDisplayed.process)
          return 'loading ...'

        return formatProcess(this.processDisplayed.process, this.processDisplayed.atomic)
      }
    },
    methods: {
      firstAction () {
        if (!this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
          this.processDisplayed.gotoFirstAction()
        } else {
          logger.debug('Go to first action method call to fast (still loading)')
        }
      },
      previousAction () {
        if (!this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
          this.processDisplayed.gotoPreviousAction()
        } else {
          logger.debug('Go to previous action method call to fast (still loading)')
        }
      },
      nextAction () {
        if (!this.processDisplayed.loading && this.processDisplayed.hasNextAction()) {
          if (this.apiRemote.started) {
            this.processDisplayed.gotoNextAction()
          } else {
            this.processDisplayed.startProcess(
              {
                query_file: this.query.path,
                id: this.processDisplayed.getNextActionId()
              })
          }
        } else {
          logger.debug('Go to next action method call to fast (still loading)')
        }
      },
      lastAction () {
        if (!this.processDisplayed.loading && this.processDisplayed.hasNextAction()) {
          if (this.apiRemote.started) {
            this.processDisplayed.gotoLastAction()
          } else {
            this.processDisplayed.startProcess(
              {
                query_file: this.query.path,
                id: this.processDisplayed.getLastActionId()
              })
          }
        } else {
          logger.debug('Go to last action method call to fast (still loading)')
        }
      },
      gotoAction (id) {
        if (!this.processDisplayed.loading) {
          this.processDisplayed.gotoAction(id)
        } else {
          logger.debug('Go to action method call to fast (still loading)')
        }
      }
    },
    beforeMount () {
      // Create the model but don't start the API util the first call.
      this.apiRemote = new ApiRemote('display-trace', this.query.path, false)
      this.processDisplayed = new ProcessDisplayedModel(this.query.getAttackedProcessId(),
                                                        this.query.getAttackedProcess(),
                                                        this.query.atomicData,
                                                        this.query.attackTrace.action_sequence,
                                                        this.apiRemote)
    },
    // Called when the user change to an other view.
    destroyed () {
      // Stop the display trace process
      this.apiRemote.exit()
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

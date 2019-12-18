<template>
  <div>
    <el-row :gutter="10">
      <el-col :md="16">
        <!-- Process code -->
        <spec-code :code="processStr" :focused-positions="focusedPositions"></spec-code>
      </el-col>
      <el-col :md="8">
        <!-- Interactions -->
        <div class="nav-buttons centred-content">
          <!-- Trace level selection -->
          <div>
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
          </div>
          <!-- Navigation buttons -->
          <div>
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
                           @mouseenter.native="focusNextActions"
                           @mouseleave.native="clearFocusActions"
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
        </div>
        <!-- Trace actions -->
        <sim-trace :actions="processDisplayed.actions"
                   :atomic="processDisplayed.atomic"
                   :current-action="processDisplayed.currentAction"
                   :trace-level="processDisplayed.traceLevel"
                   :nb-preview="nbTracePreview"
                   v-on:goto="gotoAction"
                   fixedActions></sim-trace>
        <!-- Trace Frame -->
        <sim-frame :frame="processDisplayed.frame" :atomic="processDisplayed.atomic"></sim-frame>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ProcessDisplayedModel from '../../models/ProcessDisplayedModel'
import SpecCode from '../code/SpecCode'
import { formatCode } from '../../util/process-parser'
import Helper from '../helpers/Helper'
import SimTrace from './SimTrace'
import SimFrame from './SimFrame'
import logger from 'electron-log'

export default {
  name: 'equivalence-sim-display',
  components: { SimFrame, SimTrace, Helper, SpecCode },
  props: {
    processDisplayed: {
      type: ProcessDisplayedModel,
      required: true
    }
  },
  data () {
    return {
      focusedPositions: [],
      nbTracePreview: 0
    }
  },
  computed: {
    processStr: function () {
      return formatCode(this.processDisplayed.process, this.processDisplayed.atomic)
    }
  },
  watch: {
    'processDisplayed.currentAction': function () {
      // Update next action focus if still displayed
      if (this.focusedPositions && this.focusedPositions.length > 0) {
        this.focusedPositions = this.processDisplayed.getNextActionPositions()
      }
    }
  },
  methods: {
    firstAction () {
      if (!this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
        this.processDisplayed.gotoFirstAction()
      } else {
        logger.warn('Action ignored because the process is currently loading or is impossible.')
      }
    },
    previousAction () {
      if (!this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
        this.processDisplayed.gotoPreviousAction()
      } else {
        logger.warn('Action ignored because the process is currently loading or is impossible.')
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
        logger.warn('Action ignored because the process is currently loading or is impossible.')
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
        logger.warn('Action ignored because the process is currently loading or is impossible.')
      }
    },
    gotoAction (id) {
      if (!this.processDisplayed.loading) {
        this.processDisplayed.gotoAction(id)
      } else {
        logger.warn('Action ignored because the process is currently loading.')
      }
    },
    focusNextActions () {
      this.nbTracePreview = 1
      this.focusedPositions = this.processDisplayed.getNextActionPositions()
    },
    clearFocusActions () {
      this.nbTracePreview = 0
      this.focusedPositions = []
    }
  }
}
</script>

<style scoped>
  .nav-buttons > * {
    margin-bottom: 10px;
  }
</style>

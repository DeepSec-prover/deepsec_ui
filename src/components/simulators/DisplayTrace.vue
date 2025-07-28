<template>
  <div>
    <h3>Attack on Process {{ processDisplayed.processId }}</h3>
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
              <helper helper-id="shortkeys.init" :inactive="inactivePrev">
                <el-button :disabled="inactivePrev"
                           @click="firstAction"
                           icon="el-icon-d-arrow-left"
                           v-shortkey="[ctrlOrCmd, 'arrowleft']" @shortkey.native="firstAction">
                </el-button>
              </helper>
              <helper helper-id="shortkeys.prev" :inactive="inactivePrev">
                <el-button :disabled="inactivePrev"
                           @click="previousAction"
                           icon="el-icon-arrow-left"
                           v-shortkey="['arrowleft']" @shortkey.native="previousAction">
                  Prev
                </el-button>
              </helper>
              <helper helper-id="shortkeys.next" :inactive="inactiveNext">
                <el-button :disabled="inactiveNext"
                           @click="nextAction"
                           @mouseenter.native="focusNextActions"
                           @mouseleave.native="clearFocusActions"
                           v-shortkey="['arrowright']" @shortkey.native="nextAction">
                  Next
                  <i class="el-icon-arrow-right"></i>
                </el-button>
              </helper>
              <helper helper-id="shortkeys.last" :inactive="inactiveNext">
                <el-button :disabled="inactiveNext"
                           @click="lastAction"
                           v-shortkey="[ctrlOrCmd, 'arrowright']" @shortkey.native="lastAction">
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
        <sim-frame :frame="processDisplayed.frame" :names="processDisplayed.names" :atomic="processDisplayed.atomic"></sim-frame>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QueryModel from '../../models/QueryModel'
import Helper from '../helpers/Helper'
import SpecCode from '../code/SpecCode'
import { formatCode } from '../../util/process-parser'
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
    Helper
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
      focusedPositions: [],
      nbTracePreview: 0
    }
  },
  computed: {
    ctrlOrCmd: function () {
      return process.platform === 'darwin' ? 'meta' : 'ctrl'
    },
    processStr: function () {
      if (!this.processDisplayed.process)
        return 'loading ...'

      return formatCode(this.processDisplayed.process, this.processDisplayed.atomic)
    },
    inactivePrev: function () {
      return this.processDisplayed.loading || !this.processDisplayed.hasPreviousAction()
    },
    inactiveNext: function () {
      return this.processDisplayed.loading || !this.processDisplayed.hasNextAction()
    }
  },
  watch: {
    'processDisplayed.currentAction': function () {
      // Update next action focus if still displayed
      if (this.focusedPositions && this.focusedPositions.length > 0) {
        this.focusedPositions = this.processDisplayed.getNextActionPositions()
      }

      // Disable the focus after the last action because the "mouseleave" action doesn't trigger when
      // the button is disable
      if (!this.processDisplayed.hasNextAction()) {
        this.clearFocusActions()
      }
    }
  },
  methods: {
    firstAction () {
      if (!this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
        this.processDisplayed.gotoFirstAction()
      } else {
        console.warn('Action ignored because the process is currently loading or is impossible.')
      }
    },
    previousAction () {
      if (!this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
        this.processDisplayed.gotoPreviousAction()
      } else {
        console.warn('Action ignored because the process is currently loading or is impossible.')
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
        console.warn('Action ignored because the process is currently loading or is impossible.')
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
        console.warn('Action ignored because the process is currently loading or is impossible.')
      }
    },
    gotoAction (id) {
      if (!this.processDisplayed.loading) {
        this.processDisplayed.gotoAction(id)
      } else {
        console.warn('Action ignored because the process is currently loading.')
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
    if (this.apiRemote.started && !this.apiRemote.stopped) {
      // Stop the display trace process
      this.apiRemote.sendQuery('die')
    }
  }
}
</script>

<style scoped>
  .nav-buttons > * {
    margin-bottom: 10px;
  }
</style>

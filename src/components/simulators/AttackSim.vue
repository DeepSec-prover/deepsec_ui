<template>
  <span>
    <i class="el-icon-view"></i> Single column view <el-switch v-model="singleColumn"></el-switch>
    <el-row :gutter="10">
      <el-col :lg="sizeWindows">
        <h3>Attacked Process ({{ processDisplayed.processId }})</h3>
        <el-row :gutter="10">
          <el-col :span="16">
            <!-- Process code -->
            <spec-code :code="processDisplayedStr" :focused-positions="focusedPositions"></spec-code>
          </el-col>
          <el-col :span="8">
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
              <!-- Sync Processes -->
              <div class="sync-switch">
                <span>Follow simulated</span>
                <el-switch v-model="syncProcesses"></el-switch>
              </div>
              <!-- Navigation buttons -->
              <div>
                <el-button-group>
                  <helper helper-str="Go to initial state.<br><b>Short Key</b> : ctrl + ⇦">
                    <el-button :disabled="processDisplayed.loading || !processDisplayed.hasPreviousAction()"
                               @click="firstAction"
                               icon="el-icon-d-arrow-left"
                               v-shortkey="['ctrl', 'arrowleft']" @shortkey.native="firstAction"
                               size="small">
                    </el-button>
                  </helper>
                  <helper helper-str="Go to previous action.<br><b>Short Key</b> : ⇦">
                    <el-button :disabled="processDisplayed.loading || !processDisplayed.hasPreviousAction()"
                               @click="previousAction"
                               icon="el-icon-arrow-left"
                               v-shortkey="['arrowleft']" @shortkey.native="previousAction"
                               size="small">
                      Prev
                    </el-button>
                  </helper>
                  <helper helper-str="Go to next action.<br><b>Short Key</b> : ⇨">
                    <el-button :disabled="processDisplayed.loading || !processDisplayed.hasNextAction()"
                               @click="nextAction"
                               @mouseenter.native="focusNextActions"
                               @mouseleave.native="clearFocusActions"
                               v-shortkey="['arrowright']" @shortkey.native="nextAction"
                               size="small">
                      Next
                      <i class="el-icon-arrow-right"></i>
                    </el-button>
                  </helper>
                  <helper helper-str="Go to last action.<br><b>Short Key</b> : ctrl + ⇨">
                    <el-button :disabled="processDisplayed.loading || !processDisplayed.hasNextAction()"
                               @click="lastAction"
                               v-shortkey="['ctrl', 'arrowright']" @shortkey.native="lastAction"
                               size="small">
                      <i class="el-icon-d-arrow-right"></i>
                    </el-button>
                  </helper>
                </el-button-group>
              </div>
            </div>
            <!-- Trace -->
            <sim-trace :atomic="processDisplayed.atomic"
                       :trace-level="processDisplayed.traceLevel"
                       :current-action="processDisplayed.currentAction"
                       :actions="processDisplayed.actions"
                       :nb-preview="nbTracePreview"
                       @goto="gotoActionDisplayed"
                       fixedActions></sim-trace>
            <!-- Frame -->
            <sim-frame :atomic="processDisplayed.atomic" :frame="processDisplayed.frame"></sim-frame>
          </el-col>
        </el-row>
      </el-col>
      <el-col :lg="sizeWindows">
        <h3 class="text-right">Simulated Process ({{ processUser.processId }})</h3>
        <el-row :gutter="10">
          <el-col :span="8">
            <!-- Interactions -->
            <div class="nav-buttons centred-content">
              <!-- Trace level selection -->
              <div>
                <el-radio-group v-model="processUser.traceLevel" size="small">
                  <helper helper-id="traceLevel.default">
                    <el-radio-button label="default">Default</el-radio-button>
                  </helper>
                  <helper helper-id="traceLevel.all">
                    <el-radio-button label="all">All</el-radio-button>
                  </helper>
                </el-radio-group>
              </div>
              <!-- Navigation buttons -->
              <div>
                <el-button-group>
                  <helper helper-str="Reverse previous user action.<br><b>Short Key</b> : ctrl + z">
                    <el-button :disabled="!processUser.hasBackHistory() || processDisplayed.loading || processUser.loading"
                               @click="undo"
                               icon="el-icon-refresh-left"
                               v-shortkey="['ctrl', 'z']" @shortkey.native="undo"
                               size="small">
                      Undo
                    </el-button>
                  </helper>
                  <helper helper-str="Restore previous reversed action.<br><b>Short Key</b> : ctrl + maj + z">
                    <el-button :disabled="!processUser.hasNextHistory() || processDisplayed.loading || processUser.loading"
                               @click="redo"
                               v-shortkey="['ctrl', 'shift', 'z']" @shortkey.native="redo"
                               size="small">
                      Redo
                      <i class="el-icon-refresh-right"></i>
                    </el-button>
                  </helper>
                </el-button-group>
              </div>
            </div>
            <!-- Equivalence status -->
            <equivalence-status v-if="nonEquivalenceCondition"
                              :equivalence="processUser.statusEquivalence"
                              :atomic="processUser.atomic"
                              :nextAction="getNextVisibleAction()"
                              :processDisplayedId="processDisplayed.processId"
                              class="break-word"></equivalence-status>
            <!-- Trace -->
            <sim-trace :atomic="processUser.atomic"
                       :trace-level="processUser.traceLevel"
                       :actions="processUser.actions"
                       @goto="gotoActionUser"></sim-trace>
            <!-- Frame -->
            <sim-frame :atomic="processUser.atomic" :frame="processUser.frame"></sim-frame>
          </el-col>
          <el-col :span="16">
            <!-- Process code -->
            <spec-code :code="processUserStr"
                       :atomic="processUser.atomic"
                       :available-actions="processUser.getCurrentAvailableActions()"
                       @user-select-action="executeAction"></spec-code>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </span>
</template>

<script>
import QueryModel from '../../models/QueryModel'
import SpecCode from '../code/SpecCode'
import { formatCode } from '../../util/process-parser'
import ProcessDisplayedModel from '../../models/ProcessDisplayedModel'
import ProcessUserModel from '../../models/ProcessUserModel'
import SimFrame from './SimFrame'
import SimTrace from './SimTrace'
import Helper from '../helpers/Helper'
import ApiRemote from '../../deepsec-api/ApiRemote'
import logger from 'electron-log'
import EquivalenceStatus from '../EquivalenceStatus'

export default {
  name: 'attack-sim',
  components: { EquivalenceStatus, Helper, SimTrace, SimFrame, SpecCode },
  data () {
    return {
      processDisplayed: undefined,
      processUser: undefined,
      apiRemote: undefined,
      syncProcesses: true,
      focusedPositions: [],
      nbTracePreview: 0,
      singleColumn: false
    }
  },
  props: {
    query: {
      type: QueryModel,
      required: true
    }
  },
  computed: {
    processDisplayedStr: function () {
      return formatCode(this.processDisplayed.process, this.processDisplayed.atomic)
    },
    processUserStr: function () {
      return formatCode(this.processUser.process, this.processUser.atomic)
    },
    nonEquivalenceCondition: function () {
      let isNotEquivalent =
        this.processUser && this.processUser.statusEquivalence && (
          this.processUser.statusEquivalence.status !== 'equivalent' || (
            this.processUser.statusEquivalence.status === 'equivalent' &&
            this.processUser.availableActions.default.length === 0
          )
        )

      return isNotEquivalent
    },
    sizeWindows: function () {
      return (this.singleColumn) ? 24 : 12
    }
  },
  watch: {
    'processUser.actions': function () {
      if (this.syncProcesses) {
        this.forceSyncProcesses()
      }
    },
    syncProcesses: function (newVal, _) {
      if (newVal) {
        this.forceSyncProcesses()
      }
    },
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
        this.syncProcesses = false
        this.processDisplayed.gotoFirstAction()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    },
    previousAction () {
      if (!this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
        this.syncProcesses = false
        this.processDisplayed.gotoPreviousAction()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    },
    nextAction () {
      if (!this.processDisplayed.loading && this.processDisplayed.hasNextAction()) {
        this.syncProcesses = false
        this.processDisplayed.gotoNextAction()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    },
    lastAction () {
      if (!this.processDisplayed.loading && this.processDisplayed.hasNextAction()) {
        this.syncProcesses = false
        this.processDisplayed.gotoLastAction()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    },
    gotoActionDisplayed (id) {
      if (!this.processDisplayed.loading) {
        this.syncProcesses = false
        this.processDisplayed.gotoAction(id)
      } else {
        logger.warn('Action ignored because a process is currently loading.')
      }
    },
    focusNextActions () {
      this.nbTracePreview = 1
      this.focusedPositions = this.processDisplayed.getNextActionPositions()
    },
    clearFocusActions () {
      this.nbTracePreview = 0
      this.focusedPositions = []
    },
    executeAction (action) {
      if (!this.processDisplayed.loading && !this.processUser.loading) {
        this.processUser.nextUserAction(action)
      } else {
        logger.warn('Action ignored because a process is currently loading.')
      }
    },
    gotoActionUser (id) {
      if (!this.processUser.loading) {
        this.processUser.gotoAction(id)
      } else {
        logger.warn('Action ignored because a process is currently loading.')
      }
    },
    undo () {
      if (!this.processDisplayed.loading && !this.processUser.loading && this.processUser.hasBackHistory()) {
        this.processUser.undo()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    },
    redo () {
      if (!this.processDisplayed.loading && !this.processUser.loading && this.processUser.hasNextHistory()) {
        this.processUser.redo()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    },
    forceSyncProcesses () {
      // If sync enable and not the same step level
      const goal = this.processUser.nbVisibleAction()
      if (this.processDisplayed.nbVisibleAction() !== goal) {
        this.processDisplayed.gotoNbVisibleAction(goal)
      }
    },
    /***
     * Take the number of visible actions of th current trace of the ProcessUser
     * and retrieve the next corresponding visible action of the ProcessDisplayed.
     ***/
    getNextVisibleAction () {
      const goal = this.processUser.nbVisibleAction()
      return this.processDisplayed.getVisibleAction(goal + 1)
    }
  },
  beforeMount () {
    this.apiRemote = new ApiRemote('attack-simulator', this.query.path, false)
    this.processDisplayed = new ProcessDisplayedModel(this.query.getAttackedProcessId(),
                                                      this.query.getAttackedProcess(),
                                                      this.query.atomicData,
                                                      this.query.attackTrace.action_sequence,
                                                      this.apiRemote)

    this.processUser = new ProcessUserModel(this.query.getNotAttackedProcessId(),
                                            this.query.getNotAttackedProcess(),
                                            this.query.atomicData,
                                            this.apiRemote)

    // Start the attack simulator process
    this.processUser.startProcess({ query_file: this.query.path })
  },
  // Called when the user change to an other view.
  destroyed () {
    if (this.apiRemote.started && !this.apiRemote.stopped) {
      // Stop the attack simulator process
      this.apiRemote.sendQuery('die')
    }
  }
}
</script>

<style scoped>
  .text-right {
    text-align: right;
  }

  .nav-buttons > * {
    margin-bottom: 10px;
  }

  .sync-switch {
    color: #606266;
    font-size: 15px;
  }

  .sync-switch > span {
    padding-right: 7px;
  }
</style>

<template>
  <el-row :gutter="10">
    <el-col :lg="12">
      <h3>Attacked Process</h3>
      <el-row :gutter="10">
        <el-col :span="16">
          <!-- Process code -->
          <spec-code :code="processDisplayedStr"></spec-code>
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
            <div>
              Follow user steps
              <el-switch v-model="syncProcesses"></el-switch>
            </div>
            <!-- Navigation buttons -->
            <div>
              <el-button-group v-if="!syncProcesses">
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
          <sim-trace :atomic="this.processDisplayed.atomic"
                     :trace-level="this.processDisplayed.traceLevel"
                     :current-action="this.processDisplayed.currentAction"
                     :actions="this.processDisplayed.actions"
                     determinate></sim-trace>
          <!-- Frame -->
          <sim-frame :atomic="this.processDisplayed.atomic" :frame="this.processDisplayed.frame"></sim-frame>
        </el-col>
      </el-row>
    </el-col>
    <el-col :lg="12">
      <h3 class="text-right">Simulated Process</h3>
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
                             v-shortkey="['ctrl', 'maj', 'z']" @shortkey.native="redo"
                             size="small">
                    Redo
                    <i class="el-icon-refresh-right"></i>
                  </el-button>
                </helper>
              </el-button-group>
            </div>
          </div>
          <!-- Trace -->
          <sim-trace :atomic="processUser.atomic"
                     :trace-level="processUser.traceLevel"
                     :actions="processUser.actions"></sim-trace>
          <!-- Frame -->
          <sim-frame :atomic="processUser.atomic" :frame="processUser.frame"></sim-frame>
          <el-button @click="simulateAction(processUser.availableActions.all[0])">Test next action</el-button>
        </el-col>
        <el-col :span="16">
          <!-- Process code -->
          <spec-code :code="processUserStr"></spec-code>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import QueryModel from '../../models/QueryModel'
import SpecCode from '../SpecCode'
import { formatProcess } from '../../util/process-parser'
import ProcessDisplayedModel from '../../models/ProcessDisplayedModel'
import ProcessUserModel from '../../models/ProcessUserModel'
import SimFrame from './SimFrame'
import SimTrace from './SimTrace'
import Helper from '../helpers/Helper'
import ApiRemote from '../../deepsec-api/ApiRemote'

export default {
    name: 'attack-sim',
    components: { Helper, SimTrace, SimFrame, SpecCode },
    data () {
      return {
        processDisplayed: undefined,
        processUser: undefined,
        apiRemote: undefined,
        syncProcesses: false
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
        return formatProcess(this.processDisplayed.process, this.processDisplayed.atomic)
      },
      processUserStr: function () {
        return formatProcess(this.processUser.process, this.processUser.atomic)
      }
    },
    watch: {
      'simulatedProcess.actions': function () {
        if (this.syncProcesses) {
          this.forceSyncProcesses()
        }
      },
      syncProcesses: function (newVal, _) {
        if (newVal) {
          this.forceSyncProcesses()
        }
      }
    },
    methods: {
      firstAction () {
        if (!this.syncProcesses && !this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
          this.processDisplayed.gotoFirstAction()
        }
      },
      previousAction () {
        if (!this.syncProcesses && !this.processDisplayed.loading && this.processDisplayed.hasPreviousAction()) {
          this.processDisplayed.gotoPreviousAction()
        }
      },
      nextAction () {
        if (!this.syncProcesses && !this.processDisplayed.loading && this.processDisplayed.hasNextAction()) {
          this.processDisplayed.gotoNextAction()
        }
      },
      lastAction () {
        if (!this.syncProcesses && !this.processDisplayed.loading && this.processDisplayed.hasNextAction()) {
          this.processDisplayed.gotoLastAction()
        }
      },
      gotoAction (id) {
        if (!this.syncProcesses && !this.processDisplayed.loading) {
          this.processDisplayed.gotoAction(id)
        }
      },
      simulateAction (action) {
        if (!this.processDisplayed.loading && !this.processUser.loading) {
          this.processUser.nextUserAction(action)
        }
      },
      undo () {
        if (!this.processDisplayed.loading && !this.processUser.loading && this.processUser.hasBackHistory()) {
          this.processUser.undo()
        }
      },
      redo () {
        if (!this.processDisplayed.loading && !this.processUser.loading && this.processUser.hasNextHistory()) {
          this.processUser.redo()
        }
      },
      forceSyncProcesses () {
        // If sync enable and not the same step level
        const goal = this.processUser.nbVisibleAction()
        if (this.processDisplayed.nbVisibleAction() !== goal) {
          this.processDisplayed.gotoNbVisibleAction(goal)
        }
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
      // Stop the attack simulator process
      this.apiRemote.exit()
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
</style>

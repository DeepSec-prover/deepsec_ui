<template>
  <el-row :gutter="10">
    <el-col :lg="12">
      <h3>Attacked Process</h3>
      <el-row :gutter="10">
        <el-col :span="16">
          <!-- Process code -->
          <spec-code :code="attackedProcessStr"></spec-code>
        </el-col>
        <el-col :span="8">
          <!-- Navigation buttons -->
          <div class="nav-buttons centred-content">
            <el-button-group>
              <helper helper-str="Go to initial state.<br><b>Short Key</b> : ctrl + ⇦">
                <el-button :disabled="attackedProcess.loading || !attackedProcess.hasPreviousAction()"
                           @click="firstAction"
                           icon="el-icon-d-arrow-left"
                           v-shortkey="['ctrl', 'arrowleft']" @shortkey.native="firstAction">
                </el-button>
              </helper>
              <helper helper-str="Go to previous action.<br><b>Short Key</b> : ⇦">
                <el-button :disabled="attackedProcess.loading || !attackedProcess.hasPreviousAction()"
                           @click="previousAction"
                           icon="el-icon-arrow-left"
                           v-shortkey="['arrowleft']" @shortkey.native="previousAction">
                  Prev
                </el-button>
              </helper>
              <helper helper-str="Go to next action.<br><b>Short Key</b> : ⇨">
                <el-button :disabled="attackedProcess.loading || !attackedProcess.hasNextAction()"
                           @click="nextAction"
                           v-shortkey="['arrowright']" @shortkey.native="nextAction">
                  Next
                  <i class="el-icon-arrow-right"></i>
                </el-button>
              </helper>
              <helper helper-str="Go to last action.<br><b>Short Key</b> : ctrl + ⇨">
                <el-button :disabled="attackedProcess.loading || !attackedProcess.hasNextAction()"
                           @click="lastAction"
                           v-shortkey="['ctrl', 'arrowright']" @shortkey.native="lastAction">
                  <i class="el-icon-d-arrow-right"></i>
                </el-button>
              </helper>
            </el-button-group>
          </div>
          <!-- Trace -->
          <sim-trace :atomic="this.attackedProcess.atomic"
                     :trace-level="traceLevel"
                     :current-action="this.attackedProcess.currentAction"
                     :actions="this.attackedProcess.actions"
                     determinate></sim-trace>
          <!-- Frame -->
          <sim-frame :atomic="this.attackedProcess.atomic" :frame="this.attackedProcess.frame"></sim-frame>
        </el-col>
      </el-row>
    </el-col>
    <el-col :lg="12">
      <h3 class="text-right">Simulated Process</h3>
      <el-row :gutter="10">
        <el-col :span="8">
          <!-- Navigation buttons -->
          <div class="nav-buttons centred-content">
            <el-button-group>
              <helper helper-str="Reverse previous user action.<br><b>Short Key</b> : ctrl + z">
                <el-button :disabled="simulatedProcess.loading || !simulatedProcess.canCancelHistory()"
                           @click="cancelHistory"
                           icon="el-icon-refresh-left"
                           v-shortkey="['ctrl', 'z']" @shortkey.native="cancelHistory">
                  Undo
                </el-button>
              </helper>
              <helper helper-str="Restore previous reversed action.<br><b>Short Key</b> : ctrl + maj + z">
                <el-button :disabled="simulatedProcess.loading || !simulatedProcess.canRestoreHistory()"
                           @click="restoreHistory"
                           v-shortkey="['ctrl', 'maj', 'z']" @shortkey.native="restoreHistory">
                  Redo
                  <i class="el-icon-refresh-right"></i>
                </el-button>
              </helper>
            </el-button-group>
          </div>
          <!-- Trace -->
          <sim-trace :atomic="this.simulatedProcess.atomic"
                     :trace-level="traceLevel"
                     :actions="this.simulatedProcess.actions"></sim-trace>
          <!-- Frame -->
          <sim-frame :atomic="this.simulatedProcess.atomic" :frame="this.simulatedProcess.frame"></sim-frame>
        </el-col>
        <el-col :span="16">
          <!-- Process code -->
          <spec-code :code="simulatedProcessStr"></spec-code>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
  import QueryModel from '../../models/QueryModel'
  import SpecCode from '../SpecCode'
  import { formatProcess } from '../../util/process-parser'
  import ProcessAttackedModel from '../../models/ProcessAttackedModel'
  import ProcessSimulatedModel from '../../models/ProcessSimulatedModel'
  import SimFrame from './SimFrame'
  import SimTrace from './SimTrace'
  import Helper from '../helpers/Helper'

  export default {
    name: 'attack-sim',
    components: { Helper, SimTrace, SimFrame, SpecCode },
    data () {
      return {
        attackedProcess: undefined,
        simulatedProcess: undefined,
        traceLevel: 'default'
      }
    },
    props: {
      query: {
        type: QueryModel,
        required: true
      }
    },
    computed: {
      attackedProcessStr: function () {
        return formatProcess(this.attackedProcess.process, this.attackedProcess.atomic)
      },
      simulatedProcessStr: function () {
        return formatProcess(this.simulatedProcess.process, this.simulatedProcess.atomic)
      }
    },
    methods: {
      firstAction () {

      },
      previousAction () {

      },
      nextAction () {

      },
      lastAction () {

      },
      gotoAction () {

      },
      cancelHistory () {

      },
      restoreHistory () {

      }
    },
    beforeMount () {
      this.attackedProcess = new ProcessAttackedModel(this.query.getAttackedProcess(),
                                                      this.query.atomicData,
                                                      this.query.attackTrace.action_sequence)

      this.simulatedProcess = new ProcessSimulatedModel(this.query.getNotAttackedProcess(),
                                                        this.query.atomicData)
    }
  }
</script>

<style scoped>
  .text-right {
    text-align: right;
  }

  .nav-buttons {
    margin-bottom: 10px;
  }
</style>

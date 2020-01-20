<template>
  <el-row :gutter="10">
    <el-col :md="16">
      <!-- Process code -->
      <spec-code :code="processStr"
                 :atomic="processUser.atomic"
                 :available-actions="processUser.getCurrentAvailableActions()"
                 :singleColumn="singleColumn"
                 @user-select-action="executeAction"></spec-code>
    </el-col>
    <el-col :md="8">
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
            <helper helper-id="shortkeys.undo" :inactive="inactiveUndo">
              <el-button :disabled="inactiveUndo"
                         @click="undo"
                         icon="el-icon-refresh-left"
                         v-shortkey="[ctrlOrCmd, 'z']" @shortkey.native="undo"
                         size="small">
                Undo
              </el-button>
            </helper>
            <helper helper-id="shortkeys.redo" :inactive="inactiveRedo">
              <el-button :disabled="inactiveRedo"
                         @click="redo"
                         v-shortkey="[ctrlOrCmd, 'shift', 'z']" @shortkey.native="redo"
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
                 :actions="processUser.actions"
                 @goto="gotoAction"></sim-trace>
      <!-- Frame -->
      <sim-frame :atomic="processUser.atomic" :names="processUser.names" :frame="processUser.frame"></sim-frame>
    </el-col>
  </el-row>
</template>

<script>
import ProcessUserModel from '../../models/ProcessUserModel'
import SpecCode from '../code/SpecCode'
import { formatCode } from '../../util/process-parser'
import Helper from '../helpers/Helper'
import SimTrace from './SimTrace'
import SimFrame from './SimFrame'
import logger from 'electron-log'

export default {
  name: 'equivalence-sim-user',
  components: { SimFrame, SimTrace, Helper, SpecCode },
  props: {
    processUser: {
      type: ProcessUserModel,
      required: true
    },
    singleColumn: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {}
  },
  computed: {
    ctrlOrCmd: function () {
      return process.platform === 'darwin' ? 'meta' : 'ctrl'
    },
    processStr: function () {
      return formatCode(this.processUser.process, this.processUser.atomic)
    },
    inactiveUndo: function () {
      return !this.processUser.hasBackHistory() || this.processUser.loading
    },
    inactiveRedo: function () {
      return !this.processUser.hasNextHistory() || this.processUser.loading
    }
  },
  methods: {
    executeAction (action) {
      if (!this.processUser.loading) {
        this.processUser.nextUserAction(action)
      } else {
        logger.warn('Action ignored because a process is currently loading.')
      }
    },
    gotoAction (id) {
      if (!this.processUser.loading) {
        this.processUser.gotoAction(id)
      } else {
        logger.warn('Action ignored because a process is currently loading.')
      }
    },
    undo () {
      if (!this.processUser.loading && this.processUser.hasBackHistory()) {
        this.processUser.undo()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    },
    redo () {
      if (!this.processUser.loading && this.processUser.hasNextHistory()) {
        this.processUser.redo()
      } else {
        logger.warn('Action ignored because a process is currently loading or is impossible.')
      }
    }
  }
}
</script>

<style scoped>
  .nav-buttons > * {
    margin-bottom: 10px;
  }
</style>

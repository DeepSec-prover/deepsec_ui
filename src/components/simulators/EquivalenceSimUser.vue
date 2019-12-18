<template>
  <el-row :gutter="10">
    <el-col :md="16">
      <!-- Process code -->
      <spec-code :code="processStr"
                 :atomic="processUser.atomic"
                 :available-actions="processUser.getCurrentAvailableActions()"
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
      <!-- Trace -->
      <sim-trace :atomic="processUser.atomic"
                 :trace-level="processUser.traceLevel"
                 :actions="processUser.actions"
                 @goto="gotoAction"></sim-trace>
      <!-- Frame -->
      <sim-frame :atomic="processUser.atomic" :frame="processUser.frame"></sim-frame>
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
    }
  },
  data () {
    return {
    }
  },
  computed: {
    processStr: function () {
      return formatCode(this.processUser.process, this.processUser.atomic)
    }
  },
  methods: {
    executeAction (action) {
      if (!this.processDisplayed.loading && !this.processUser.loading) {
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
  }
}
</script>

<style scoped>
  .nav-buttons > * {
    margin-bottom: 10px;
  }
</style>
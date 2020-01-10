<template>
  <span>
    <i class="el-icon-view"></i> Single column view <el-switch v-model="singleColumn"></el-switch>
    <el-row :gutter="10">
      <el-col v-for="process in processes" :key="process.processId" :lg="sizeWindows(process)">
        <!-- Title -->
        <h3>
          Process {{ process.processId }}

          <span class="action-buttons">
            <el-button v-if="isFixedProcess(process) && simulatorState === 'phase-1'"
                       :disabled="getSelectedProcessModel().actions.length === 0"
                       size="small" icon="el-icon-video-play" type="success"
                       @click="findEquivalentTrace">
              Find equivalent trace
            </el-button>

            <el-button class="start-button" size="small" icon="el-icon-video-play"
                       :type="isApiRunning ? '' : 'primary'" plain
                       @click="startOrResetSimulation(process.processId)">
              <template v-if="selectedProcessId === process.processId">
                Reset
              </template>
              <template v-else>
                Select trace of process {{ process.processId }}
              </template>
            </el-button>
          </span>
        </h3>
        <!-- Display Process -->
        <template v-if="isDisplayProcess(process)">
          <equivalence-sim-display :processDisplayed="process"></equivalence-sim-display>
        </template>
        <!-- User Interactive Process -->
        <template v-else-if="isUserProcess(process)">
          <equivalence-sim-user :processUser="process"></equivalence-sim-user>
        </template>
        <!-- Fixed Process -->
        <template v-else>
          <spec-code :code="processesStr[process.processId - 1]"></spec-code>
        </template>
      </el-col>
    </el-row>
  </span>
</template>

<script>
import QueryModel from '../../models/QueryModel'
import ApiRemote from '../../deepsec-api/ApiRemote'
import ProcessModel from '../../models/ProcessModel'
import SpecCode from '../code/SpecCode'
import { formatCode } from '../../util/process-parser'
import ProcessUserModel from '../../models/ProcessUserModel'
import ProcessDisplayedModel from '../../models/ProcessDisplayedModel'
import EquivalenceSimDisplay from './EquivalenceSimDisplay'
import EquivalenceSimUser from './EquivalenceSimUser'
import logger from 'electron-log'
import Vue from 'vue'
import errorMessage from '../errorMessage'

export default {
  name: 'equivalence-sim',
  components: {
    EquivalenceSimDisplay,
    EquivalenceSimUser,
    SpecCode
  },
  props: {
    query: {
      type: QueryModel,
      required: true
    }
  },
  data () {
    return {
      apiRemote: undefined,
      processes: [],
      simulatorState: 'not-started',
      selectedProcessId: undefined,
      singleColumn: false
    }
  },
  computed: {
    processesStr: function () {
      // TODO split to improve perf
      return this.processes.map(p => formatCode(p.process, p.atomic))
    },
    isApiRunning: function () {
      return this.apiRemote.started && !this.apiRemote.stopped
    }
  },
  methods: {
    /**
     * Start or reset the simulation.
     * This is the beginning of the phase 1.
     * @see doc/flows/equivalence_simulator.svg
     *
     * @param {Number} selectedId The selected process id (1 or 2)
     */
    startOrResetSimulation (selectedId) {
      this.selectedProcessId = selectedId

      const notSelectedId = selectedId % 2
      selectedId = selectedId - 1

      // Convert to proper model (use Vue.set for reactivity)
      Vue.set(this.processes, selectedId, ProcessUserModel.convertToProcessUser(this.processes[selectedId]))
      Vue.set(this.processes, notSelectedId, ProcessUserModel.convertToProcess(this.processes[notSelectedId]))

      // Set loading
      this.getSelectedProcessModel().loading = true
      // Reset processes
      this.processes[selectedId].process = this.query.processes[selectedId]
      this.processes[notSelectedId].process = this.query.processes[notSelectedId]

      if (this.isApiRunning) {
        this.apiRemote.sendQuery('reset_simulator', selectedId + 1)
      } else {
        // Handle future user error
        this.apiRemote.onReply((_, answer) => {
          if (!answer.success) {
            this.userError(answer.content)
          }
        }, false)
        // Start the API
        this.apiRemote.start({ query_file: this.query.path, process_id: selectedId + 1 })
      }
      this.simulatorState = 'phase-1'
    },
    /**
     * Find the equivalent trace in the not selected process which match with
     * the trace that the user selected.
     * This is the beginning of the phase 2.
     * @see doc/flows/equivalence_simulator.svg
     */
    findEquivalentTrace () {
      const notSelectedProcessId = this.selectedProcessId % 2
      const selectedProcessId = this.selectedProcessId - 1

      // Convert to proper model (use Vue.set for reactivity)
      Vue.set(this.processes,
              selectedProcessId,
              ProcessDisplayedModel.convertToProcessDisplay(this.processes[selectedProcessId], true))
      Vue.set(this.processes,
              notSelectedProcessId,
              ProcessDisplayedModel.convertToProcessDisplay(this.processes[notSelectedProcessId]))

      // Set loading
      this.processes[notSelectedProcessId].loading = true

      // Wait for the next reply
      this.apiRemote.onReply((_, answer) => {
        if (answer.success) {
          logger.silly('Equivalent trace received.')
          this.processes[notSelectedProcessId].actions = answer.content.action_sequence
          this.processes[notSelectedProcessId].loading = false
        } else {
          logger.error(`Equivalent trace finding failed : ${JSON.stringify(answer)}`)
        }
        this.loading = false
      })

      this.simulatorState = 'phase-2'

      this.apiRemote.sendQuery('find_equivalent_trace')
    },
    isDisplayProcess (process) {
      return process instanceof ProcessDisplayedModel
    },
    isUserProcess (process) {
      return process instanceof ProcessUserModel
    },
    isFixedProcess (process) {
      return !this.isDisplayProcess(process) && !this.isUserProcess(process)
    },
    getSelectedProcessModel () {
      return this.processes[this.selectedProcessId - 1]
    },
    userError (content) {
      this.$msgbox({
                     title: 'User error',
                     // Create a component on the fly but vuejs seem to use the same every time
                     message: this.$createElement(errorMessage, { props: { msg: content.error_msg } }),
                     confirmButtonText: 'OK',
                     type: 'error'
                   })
      this.getSelectedProcessModel().undo()
    },
    sizeWindows: function(process) {
      if (this.singleColumn) {
        return 24
      } else {
        if (this.simulatorState === 'phase-1') {
          return this.isUserProcess(process) ? 14 : 10
        } else {
          return 12
        }
      }
    }
  },
  beforeMount () {
    this.apiRemote = new ApiRemote('equivalence-simulator', this.query.path, false)
    // (use Vue.set for reactivity)
    Vue.set(this.processes, 0, new ProcessModel(1,
                                                this.query.processes[0],
                                                this.query.atomicData,
                                                [],
                                                this.apiRemote,
                                                false))
    Vue.set(this.processes, 1, new ProcessModel(2,
                                                this.query.processes[1],
                                                this.query.atomicData,
                                                [],
                                                this.apiRemote,
                                                false))
  },
  destroyed () {
    if (this.apiRemote.started && !this.apiRemote.stopped) {
      // Stop the attack simulator process
      this.apiRemote.sendQuery('die')
    }
  }
}
</script>

<style scoped>
  .action-buttons > * {
    margin-left: 10px;
  }
</style>

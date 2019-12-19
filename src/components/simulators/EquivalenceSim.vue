<template>
  <el-row :gutter="10">
    <el-col v-for="process in processes" :key="process.processId" :lg="12">
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
            <template v-if="selectedProcess === process.processId">
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
      selectedProcess: undefined
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
      this.selectedProcess = selectedId

      const notSelectedId = selectedId % 2
      selectedId = selectedId - 1

      // Convert to proper model
      this.processes[selectedId] = ProcessUserModel.convertToProcessUser(this.processes[selectedId])
      this.processes[notSelectedId] = ProcessUserModel.convertToProcess(this.processes[notSelectedId])
      // Set loading
      this.getSelectedProcessModel().loading = true
      // Reset processes
      this.processes[selectedId].process = this.query.processes[selectedId]
      this.processes[notSelectedId].process = this.query.processes[notSelectedId]

      if (this.isApiRunning) {
        this.apiRemote.sendQuery('reset_simulator', selectedId + 1)
      } else {
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
      // Convert to proper model
      this.processes[0] = ProcessDisplayedModel.convertToProcessDisplay(this.processes[0])
      this.processes[1] = ProcessDisplayedModel.convertToProcessDisplay(this.processes[1])
      // Set loading
      this.getNotSelectedProcessModel().loading = true
      // Reset processes
      this.processes[0] = this.query.processes[0]
      this.processes[1] = this.query.processes[1]

      // Wait for the next reply
      this.apiRemote.onReply((_, answer) => {
        if (answer.success) {
          logger.silly('Equivalent trace received.')
          const selectedProcess = this.getNotSelectedProcessModel()
          selectedProcess.actions = answer.content.action_sequence
          selectedProcess.loading = false
        } else {
          logger.error(`Equivalent trace finding failed : ${JSON.stringify(answer)}`)
        }
        this.loading = false
      })

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
      return this.processes[this.selectedProcess - 1]
    },
    getNotSelectedProcessModel () {
      return this.processes[this.selectedProcess % 2]
    }
  },
  beforeMount () {
    this.apiRemote = new ApiRemote('equivalence-simulator', this.query.path, false)
    this.processes[0] = new ProcessModel(1,
                                         this.query.processes[0],
                                         this.query.atomicData,
                                         [],
                                         this.apiRemote,
                                         false)
    this.processes[1] = new ProcessModel(2,
                                         this.query.processes[1],
                                         this.query.atomicData,
                                         [],
                                         this.apiRemote,
                                         false)
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

<template>
  <el-row :gutter="10">
    <el-col v-for="process in processes" :lg="12">
      <!-- Title -->
      <h3>
        Process {{ process.processId }}
        <el-button class="start-button" size="small" icon="el-icon-video-play" type="primary" plain
                   @click="startSimulator(process.processId)">
          {{ isApiRunning ? 'Restart' : 'Start' }} with process {{ process.processId }}
        </el-button>
      </h3>
      <!-- Display Process -->
      <template v-if="isDisplayProcess(process)">
        Display
      </template>
      <!-- User Interactive Process -->
      <template v-else-if="isUserProcess(process)">
        User
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

export default {
  name: 'equivalence-sim',
  components: { SpecCode },
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
      simulatorState: 'not-started'
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
    startSimulator (selectedId) {
      selectedId = selectedId - 1
      const notSelectedId = (selectedId + 1) % 2
      this.processes[selectedId] = ProcessUserModel.convertToProcessUser(this.processes[selectedId])
      this.processes[notSelectedId] = ProcessDisplayedModel.convertToProcessDisplay(this.processes[notSelectedId])

      if (this.isApiRunning) {
        this.apiRemote.sendQuery('reset_simulator', selectedId)
      } else {
        this.apiRemote.start({ query_file: this.query.path, process_id: selectedId })
      }
      this.simulatorState = 'phase-1'
    },
    isDisplayProcess (process) {
      return process instanceof ProcessDisplayedModel
    },
    isUserProcess (process) {
      return process instanceof ProcessUserModel
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
.start-button {
  margin-left: 10px;
}
</style>

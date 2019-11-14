<template>
  <el-row :gutter="20">
    <el-col :md="16">
      <h3>Attack on Process {{ queryTrace.query.attackTrace.index_process + 1 }}</h3>
      <spec-code :code="processStr"></spec-code>
    </el-col>
    <el-col :md="8">
      <el-card header="Trace">
        <ul>
          <li v-for="i in queryTrace.actions.length" v-if="visibleActions[i-1]">
            <spec-code in-line :code="actionsStr[i-1]"></spec-code>
          </li>
        </ul>
      </el-card>
      <h3>Frame</h3>
    </el-col>
  </el-row>
</template>

<script>
  import QueryModel from '../../models/QueryModel'
  import QueryTraceModel from '../../models/QueryTraceModel'
  import SpecCode from '../SpecCode'
  import { formatAction, formatProcess } from '../../util/process-parser'

  export default {
    name: 'query-trace',
    components: { SpecCode },
    props: {
      query: {
        type: QueryModel
      }
    },
    data () {
      return {
        queryTrace: null,
        traceLevel: 'default' // default or io or full
      }
    },
    computed: {
      processStr: function () {
        return formatProcess(this.queryTrace.process, this.query.atomicData)
      },
      actionsStr: function () {
        let axiomIdRef = {value: 1}
        let actionsStr = []

        // Format all actions
        this.queryTrace.actions.forEach(a => {
          actionsStr.push(formatAction(a, this.queryTrace.atomic, axiomIdRef))
        })

        return actionsStr
      },
      visibleActions: function () {
        let actions = []

        this.queryTrace.actions.forEach(a => {
          switch (this.traceLevel) {
            case 'default':
              actions.push(a.type === 'output' || a.type ===  'input' || a.type ===  'eavesdrop')
              break
            case 'io':
              actions.push(a.type === 'output' || a.type ===  'input' || a.type ===  'eavesdrop')
              break
            case 'full':
              actions.push(true)
              break
          }
        })

        return actions
      }
    },
    beforeMount () {
      this.queryTrace = new QueryTraceModel(this.query)
    }
  }
</script>

<style scoped>

</style>

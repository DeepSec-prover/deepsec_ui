<template>
  <el-row type="flex" :gutter="10" justify="center">
    <el-col :span="12" v-for="(process, index) in processesStr">
      <h3>Process {{ index + 1 }}</h3>
      <spec-code :code="process"></spec-code>
    </el-col>
  </el-row>
</template>

<script>
  import { formatProcess } from '../../util/process-parser'
  import SpecCode from '../SpecCode'

  export default {
    name: 'query-processes',
    components: {
      SpecCode
    },
    props: {
      query: Object
    },
    computed: {
      processesStr: function () {
        return this.query.processes.map(p => formatProcess(p, this.query.atomicData))
      },
    }
  }
</script>

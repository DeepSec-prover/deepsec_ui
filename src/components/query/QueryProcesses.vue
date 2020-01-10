<template>
  <span>
    <i class="el-icon-view"></i> Single column view <el-switch v-model="singleColumn"></el-switch>
    <el-row :gutter="10" justify="center">
      <el-col :lg="sizeWindows" v-for="(process, index) in processesStr">
        <h3>Process {{ index + 1 }}</h3>
        <spec-code :code="process"></spec-code>
      </el-col>
    </el-row>
  </span>
</template>

<script>
import { formatCode } from '../../util/process-parser'
import SpecCode from '../code/SpecCode'

export default {
  name: 'query-processes',
  components: {
    SpecCode
  },
  props: {
    query: Object,
    required: true
  },
  computed: {
    processesStr: function () {
      return this.query.processes.map(p => formatCode(p, this.query.atomicData))
    },
    sizeWindows: function () {
      return (this.singleColumn) ? 24 : 12
    }
  },
  data () {
    return {
      singleColumn: false
    }
  }
}
</script>

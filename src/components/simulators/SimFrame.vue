<template>
  <el-card header="Frame">
    <ul v-if="frame.length > 0" class="no-bullet">
      <li v-for="i in frame.length">
        <spec-code in-line :code="`ax_${i} -> ${ termsStr[i-1] }`"></spec-code>
      </li>
    </ul>
    <div v-else class="centred-content info-text">
      Empty
    </div>
  </el-card>
</template>

<script>
  import SpecCode from '../SpecCode'
  import { formatProcess } from '../../util/process-parser'
  import AtomicRenamer from '../../util/AtomicRenamer'

  export default {
    name: 'sim-frame',
    props: {
      frame: {
        type: Array
      },
      atomic: {
        type: AtomicRenamer
      }
    },
    components: {
      SpecCode
    },
    computed: {
      termsStr: function () {
        return this.frame.map(q => formatProcess(q, this.atomic))
      }
    }
  }
</script>

<style scoped>
  .no-bullet {
    list-style-type: none;
    padding: 0;
    margin: 0 0 0 10px;
  }

  .info-text {
    font-style: italic;
    color: #909399;
  }
</style>

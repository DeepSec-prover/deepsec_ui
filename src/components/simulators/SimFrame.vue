<template>
  <el-card header="Frame">
    <ul v-if="frame.length > 0" class="no-bullet">
      <simplebar>
        <li v-for="i in frame.length">
          <spec-code-inline :code="`ax_${i} -> ${ termsStr[i-1] }`"></spec-code-inline>
        </li>
      </simplebar>
    </ul>
    <div v-else class="centred-content info-text">
      Empty
    </div>
  </el-card>
</template>

<script>
import Simplebar from 'simplebar-vue'
import { formatCode } from '../../util/process-parser'
import AtomicRenamer from '../../util/AtomicRenamer'
import SpecCodeInline from '../code/SpecCodeInline'

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
    SpecCodeInline,
    Simplebar
  },
  computed: {
    termsStr: function () {
      return this.frame.map(q => formatCode(q, this.atomic))
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

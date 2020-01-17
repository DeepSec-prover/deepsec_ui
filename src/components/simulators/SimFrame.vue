<template>
  <el-card header="Frame">
    <ul v-if="frame.length > 0" class="no-bullet">
      <simplebar id="frames-content">
        <template v-if="nameExists">
          <el-tag size="mini" effect="plain" class="tag">Private names:</el-tag> <spec-code-inline :code="nameListStr"></spec-code-inline>
          <el-divider class="frames-divider"></el-divider>
        </template>
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
    names: {
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
    },
    nameListStr: function () {
      let namesArray = this.names.map(q => formatCode(q, this.atomic))
      return namesArray.join(', ')
    },
    nameExists: function () {
      return this.names.length !== 0
    }
  }
}
</script>

<style scoped>
  .tag {
    margin-right: 5px;
  }

  .frames-divider {
    margin: 10px 0;
  }

  .no-bullet {
    list-style-type: none;
    padding: 0;
    margin: 0 0 0 10px;
  }

  .info-text {
    font-style: italic;
    color: #909399;
  }

  #frames-content {
    max-height: 30vh; /* 30% of the window height */
  }
</style>

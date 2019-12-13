<template>
  <el-alert class="equiv-message" type="warning" :closable="false">

    <template v-slot:title>
      {{ text.query.equivalence_status[equivalence.status] }}
    </template>

    <template v-if="equivalence.status === 'non_equivalent_message'">
      The recipe
      <spec-code :code="recipeStr" in-line></spec-code>
      yields the message
      <spec-code :code="termStr" in-line></spec-code>
      on Process {{ equivalence.process_id }}
      but fails to compute a message on Process {{ (equivalence.process_id % 2) + 1 }}.
    </template>

    <template v-else>
      The two recipes
      <spec-code :code="recipe1Str" in-line></spec-code>
      and
      <spec-code :code="recipe2Str" in-line></spec-code>
      yield the same message
      <spec-code :code="termEqualStr" in-line></spec-code>
      on Process {{ equivalence.process_id }}
      but they yield different messages on Process {{ (equivalence.process_id % 2) + 1 }}
      (
      <spec-code :code="term1Str" in-line></spec-code>
      and
      <spec-code :code="term2Str" in-line></spec-code>
      respectively).
    </template>

  </el-alert>
</template>

<script>
import text from '../text-content/text'
import SpecCode from './SpecCode'
import AtomicRenamer from '../util/AtomicRenamer'
import { formatProcess } from '../util/process-parser'

export default {
  name: 'equivalence-status',
  components: { SpecCode },
  props: {
    equivalence: {
      type: Object,
      required: true
    },
    atomic: {
      type: AtomicRenamer,
      required: true
    }
  },
  data () {
    return {
      text: text
    }
  },
  computed: {
    recipeStr: function () {
      return formatProcess(this.equivalence.recipe, this.atomic)
    },
    termStr: function () {
      return formatProcess(this.equivalence.term, this.atomic)
    },
    recipe1Str: function () {
      return formatProcess(this.equivalence.recipe1, this.atomic)
    },
    recipe2Str: function () {
      return formatProcess(this.equivalence.recipe2, this.atomic)
    },
    termEqualStr: function () {
      return formatProcess(this.equivalence.term_equal, this.atomic)
    },
    term1Str: function () {
      return formatProcess(this.equivalence.term1, this.atomic)
    },
    term2Str: function () {
      return formatProcess(this.equivalence.term2, this.atomic)
    }
  }
}
</script>

<style scoped>
  .equiv-message {
    margin: 15px 0;
  }
</style>

<style>
  .equiv-message .el-alert__description {
    font-size: 16px !important;
  }

  .equiv-message .el-alert__title {
    font-size: 18px;
    line-height: 22px;
  }
</style>

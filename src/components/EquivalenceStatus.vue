<template>
  <el-alert class="equiv-message" type="warning" :closable="false">

    <template v-slot:title>
      {{ text.query.equivalence_status[equivalence.status] }}
    </template>

    <template v-if="equivalence.status === 'non_equivalent_message'">
      The recipe
      <spec-code-inline :code="recipeStr"></spec-code-inline>
      yields the message
      <spec-code-inline :code="termStr"></spec-code-inline>
      on Process {{ equivalence.process_id }}
      but fails to compute a message on Process {{ (equivalence.process_id % 2) + 1 }}.
    </template>

    <template v-else>
      The two recipes
      <spec-code-inline :code="recipe1Str"></spec-code-inline>
      and
      <spec-code-inline :code="recipe2Str"></spec-code-inline>
      yield the same message
      <spec-code-inline :code="termEqualStr"></spec-code-inline>
      on Process {{ equivalence.process_id }}
      but they yield different messages on Process {{ (equivalence.process_id % 2) + 1 }}
      (<spec-code-inline :code="term1Str"></spec-code-inline> and <spec-code-inline :code="term2Str"></spec-code-inline> respectively).
    </template>

  </el-alert>
</template>

<script>
import text from '../text-content/text'
import AtomicRenamer from '../util/AtomicRenamer'
import { formatCode } from '../util/process-parser'
import SpecCodeInline from './code/SpecCodeInline'

export default {
  name: 'equivalence-status',
  components: { SpecCodeInline },
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
      return formatCode(this.equivalence.recipe, this.atomic)
    },
    termStr: function () {
      return formatCode(this.equivalence.term, this.atomic)
    },
    recipe1Str: function () {
      return formatCode(this.equivalence.recipe1, this.atomic)
    },
    recipe2Str: function () {
      return formatCode(this.equivalence.recipe2, this.atomic)
    },
    termEqualStr: function () {
      return formatCode(this.equivalence.term_equal, this.atomic)
    },
    term1Str: function () {
      return formatCode(this.equivalence.term1, this.atomic)
    },
    term2Str: function () {
      return formatCode(this.equivalence.term2, this.atomic)
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

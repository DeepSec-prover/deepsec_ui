<template>
  <el-card class="equiv-message">

    <template v-slot:header>
      {{ text.query.equivalence_status[equivalence.status] }}
    </template>

    <simplebar>
      <template v-if="equivalence.status === 'non_equivalent_message'">
        The recipe
        <spec-code-inline :code="recipeStr"></spec-code-inline>
        yields the message
        <spec-code-inline :code="termStr"></spec-code-inline>
        on Process {{ equivalence.process_id }}
        but fails to compute a message on Process {{ (equivalence.process_id % 2) + 1 }}.
      </template>

      <template v-else-if="equivalence.status === 'non_equivalent_equality'">
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

      <template v-else>
        To imitate the attack trace of Process {{ processDisplayedId }}, an {{ nextAction.type }} transition on the channel
        <spec-code-inline :code="channelStr"></spec-code-inline>
        should be available in Process {{ processDisplayedId %2 + 1 }} but no more visible actions are available.
      </template>
    </simplebar>
  </el-card>

</template>

<script>
import Simplebar from 'simplebar-vue'
import text from '../text-content/text'
import AtomicRenamer from '../util/AtomicRenamer'
import { formatCode } from '../util/process-parser'
import SpecCodeInline from './code/SpecCodeInline'

export default {
  name: 'equivalence-status',
  components: { SpecCodeInline, Simplebar },
  props: {
    equivalence: {
      type: Object,
      required: true
    },
    atomic: {
      type: AtomicRenamer,
      required: true
    },
    nextAction: {
      type: Object,
      require: true
    },
    processDisplayedId: {
      type: Number,
      required: true
    },
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
    },
    channelStr: function () {
      return formatCode(this.nextAction.channel, this.atomic)
    }
  }
}
</script>

<style scoped>
  .equiv-message {
    margin: 15px 0;
    background-color: #fef0f0;
    color: #F56C6C;
    opacity: 1;
  }
</style>

<style>
  .equiv-message .el-card__body {
    font-size: 16px !important;
  }

  .equiv-message .el-card__header {
    font-size: 20px;
    line-height: 22px;
    font-weight: 700;
  }
</style>

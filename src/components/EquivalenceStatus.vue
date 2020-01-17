<template>
  <el-card class="equiv-message">

    <template v-slot:header>
      {{ text.query.equivalence_status[equivalence.status] }}
    </template>
    <template v-if="equivalence.status === 'non_equivalent_message'">
      The recipe
      <spec-code-inline :code="recipeStr"></spec-code-inline>
      evaluates to
      <spec-code-inline :code="termStr"></spec-code-inline>
      on process {{ equivalence.process_id }}
      but fails on process {{ (equivalence.process_id % 2) + 1 }}.
    </template>

    <template v-else-if="equivalence.status === 'non_equivalent_equality'">
      The test <spec-code-inline :code="recipe1Str + ' = ' + recipe2Str"></spec-code-inline>
      holds on process {{ equivalence.process_id }}, but not on process {{ (equivalence.process_id % 2) + 1 }}.
      <ul>
        <li><spec-code-inline :code="recipe1Str"></spec-code-inline> and <spec-code-inline :code="recipe2Str"></spec-code-inline>
          evaluate to <spec-code-inline :code="termEqualStr"></spec-code-inline> in process {{ equivalence.process_id }}.
        </li>
        <li><spec-code-inline :code="recipe1Str"></spec-code-inline> evaluates to <spec-code-inline :code="term1Str"></spec-code-inline>
          on process {{ (equivalence.process_id % 2) + 1 }}.
        </li>
        <li><spec-code-inline :code="recipe2Str"></spec-code-inline> evaluates to <spec-code-inline :code="term2Str"></spec-code-inline>
          on process {{ (equivalence.process_id % 2) + 1 }}.
        </li>
      </ul>
    </template>

    <template v-else>
      Impossible to match the visible transition <spec-code-inline :code="actionStr"></spec-code-inline> of process {{ processDisplayedId }}.
    </template>
  </el-card>

</template>

<script>
import text from '../text-content/text'
import AtomicRenamer from '../util/AtomicRenamer'
import { formatCode, formatAction } from '../util/process-parser'
import SpecCodeInline from './code/SpecCodeInline'

export default {
  name: 'equivalence-status',
  components: { SpecCodeInline },
  props: {
    equivalence: {
      type: Object,
      required: true
    },
    atomicUser: {
      type: AtomicRenamer,
      required: true
    },
    atomicDisplayed: {
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
      // For recipes, we do not need to distinguish the atomic renamer since no names occur.
      return formatCode(this.equivalence.recipe, this.atomicDisplayed)
    },
    termStr: function () {
      const atomic = (this.processDisplayedId === this.equivalence.process_id) ? this.atomicDisplayed : this.atomicUser
      return formatCode(this.equivalence.term, atomic)
    },
    recipe1Str: function () {
      // For recipes, we do not need to distinguish the atomic renamer since no names occur.
      return formatCode(this.equivalence.recipe1, this.atomicDisplayed)
    },
    recipe2Str: function () {
      // For recipes, we do not need to distinguish the atomic renamer since no names occur.
      return formatCode(this.equivalence.recipe2, this.atomicDisplayed)
    },
    termEqualStr: function () {
      const atomic = (this.processDisplayedId === this.equivalence.process_id) ? this.atomicDisplayed : this.atomicUser
      return formatCode(this.equivalence.term_equal, atomic)
    },
    term1Str: function () {
      const atomic = (this.processDisplayedId === this.equivalence.process_id) ? this.atomicUser : this.atomicDisplayed
      return formatCode(this.equivalence.term1, atomic)
    },
    term2Str: function () {
      const atomic = (this.processDisplayedId === this.equivalence.process_id) ? this.atomicUser : this.atomicDisplayed
      return formatCode(this.equivalence.term2, atomic)
    },
    actionStr: function () {
      // For action, we do not need to distinguish the atomic renamer since no names occur.
      return formatAction(this.nextAction.action, this.atomic,this.nextAction.lastAxiom)
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

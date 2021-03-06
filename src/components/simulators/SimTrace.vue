<template>
  <el-card class="steps-frame">
    <template slot="header">
      <template v-if="fixedActions">
        <template v-if="currentAction === -1">
          Trace - {{ actions.length }} Step{{ actions.length > 1 ? 's' : '' }}
        </template>
        <template v-else>
          Trace - Step {{ currentAction + 1 }} / {{ actions.length }}
        </template>
      </template>
      <template v-else>
        <template v-if="actions.length === 0">
          Trace
        </template>
        <template v-else>
          Trace - Step {{ actions.length }}
        </template>
      </template>
    </template>
    <div v-if="isInitialState" class="centred-content info-text">
      Initial state
    </div>
    <div v-else-if="noActionVisible" class="centred-content info-text">
      Nothing visible with this detail level
    </div>
    <simplebar v-else id="steps">
      <div id="trace-actions">
        <!-- Initial actions -->
        <template v-if="traceLevel === 'all' && actions.length > 0">
          <span class="action-index">0</span>
          <span class="action-description">
            <spec-code-inline code="initial state" @click.native="gotoAction(-1)" class="clickable tau"></spec-code-inline>
          </span>
        </template>
        <!-- Current actions -->
        <template v-for="a in visibleActions">
          <span class="action-index" :class="{'bold': lastActionId === a.index}" :key="a.index">{{ a.index + 1 }}</span>
          <span class="action-description" :key="a.index + '-desc'">
            <spec-code-inline :code="actionsStr[a.index]"
                              @click.native="gotoAction(a.index)"
                              :class="{'clickable': lastActionId !== a.index, 'tau': isTauAction(a.action)}">
            </spec-code-inline>
          </span>
        </template>
        <!-- Preview of future actions -->
        <template v-for="a in previewActions">
          <span class="action-index preview" :key="a.index">{{ a.index + 1 }}</span>
          <span class="action-description" :key="a.index + '-desc'">
            <spec-code-inline :code="actionsStr[a.index]" :class="{'tau': isTauAction(a.action)}"></spec-code-inline>
          </span>
        </template>
      </div>
    </simplebar>
  </el-card>
</template>

<script>
import Simplebar from 'simplebar-vue'
import { formatAction } from '../../util/process-parser'
import AtomicRenamer from '../../util/AtomicRenamer'
import ProcessModel from '../../models/ProcessModel'
import SpecCodeInline from '../code/SpecCodeInline'

export default {
  name: 'sim-trace',
  components: {
    SpecCodeInline,
    Simplebar
  },
  data () {
    return {
      visibleActions: [],
      previewActions: [],
      noActionVisible: true
    }
  },
  props: {
    actions: {
      type: Array,
      required: true
    },
    currentAction: {
      type: Number,
      default: -1
    },
    traceLevel: {
      type: String,
      required: true
    },
    atomic: {
      type: AtomicRenamer,
      required: true
    },
    /**
     * If the list of action won't change.
     */
    fixedActions: {
      type: Boolean,
      default: false
    },
    /**
     * The number of next action preview to show.
     */
    nbPreview: {
      type: Number,
      default: 0
    }
  },
  computed: {
    actionsStr: function () {
      let axiomIdRef = { value: 1 }
      let actionsStr = []

      // Format all actions
      this.actions.forEach(a => {
        actionsStr.push(formatAction(a, this.atomic, axiomIdRef))
      })

      return actionsStr
    },
    isInitialState: function () {
      if (this.fixedActions) {
        return (this.currentAction + this.nbPreview) === -1
      } else {
        return this.actions.length === 0
      }
    },
    lastActionId: function () {
      if (this.fixedActions) {
        return this.currentAction
      } else {
        return this.actions.length - 1
      }
    }
  },
  methods: {
    /**
     * Filter action by visibility status.
     * An action is not visible if it hasn't been executed yet or if it isn't in the scope of the
     * current trace level.
     *
     * @returns {[Boolean]} An array of boolean where every position match with an action of the trace.
     */
    computeVisibleActions () {
      this.visibleActions = []
      this.previewActions = []
      let oneActionVisible = false
      let countPreview = 0

      for (let i = 0; i < this.actions.length; i++) {
        const a = this.actions[i]
        // Current action limit
        if (this.fixedActions && i > this.currentAction) {
          // Add in preview if necessary
          if (countPreview < this.nbPreview) {
            if (ProcessModel.isVisibleAction(a, this.traceLevel)) {
              this.previewActions.push({ index: i, action: a })
              oneActionVisible = true
              countPreview++
            }
          } else {
            break
          }
        } else {
          // Add in list if visible
          if (ProcessModel.isVisibleAction(a, this.traceLevel)) {
            this.visibleActions.push({ index: i, action: a })
            oneActionVisible = true
          }
        }
      }

      // Set at the end to avoid multiple update
      this.noActionVisible = !oneActionVisible
    },
    isTauAction (action) {
      return ['tau', 'comm', 'bang', 'choice'].includes(action.type)
    },
    gotoAction (id) {
      if (this.lastActionId !== id) {
        this.$emit('goto', id)
      }
    }
  },
  watch: {
    // Manual trigger visible actions because computed method fail to detect changes.
    traceLevel: function () {
      this.computeVisibleActions()
    },
    currentAction: function () {
      this.computeVisibleActions()
    },
    'actions.length': function () {
      this.computeVisibleActions()
    },
    nbPreview: function () {
      this.computeVisibleActions()
    }
  },
  beforeMount () {
    this.computeVisibleActions()
  }
}
</script>

<style scoped>
  .info-text {
    font-style: italic;
    color: #909399;
  }

  #trace-actions {
    list-style-type: none;
    display: grid;
    grid-template-columns: minmax(40px, max-content) 1fr
  }

  #trace-actions .action-index {
    text-align: right;
    margin-right: 5px;
    color: #909399;
    align-self: center;
  }

  #trace-actions .action-index:after {
    content: " - ";
  }

  .tau {
    opacity: 0.5;
  }

  #steps {
    max-height: 30vh; /* 30% of the window height */
  }

  .steps-frame {
    margin-bottom: 20px;
  }

  #trace-actions .action-index.preview {
    color: rgba(255, 0, 0, 0.7);
  }

  .bold {
    font-weight: bold;
  }
</style>

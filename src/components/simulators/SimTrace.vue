<template>
  <el-card class="steps-frame">
    <template slot="header">
      <template v-if="currentAction === -1">
        Trace - {{ actions.length }} Step{{ actions.length > 1 ? 's' : '' }}
      </template>
      <template v-else>
        Trace - Step {{ currentAction + 1 }} / {{ actions.length }}
      </template>
    </template>
    <div v-if="currentAction === -1" class="centred-content info-text">
      Initial state
    </div>
    <div v-else-if="noActionVisible" class="centred-content info-text">
      Nothing visible with this detail level
    </div>
    <simplebar v-else id="steps">
      <div id="trace-actions">
        <template v-for="i in actions.length" v-if="visibleActions[i-1]">
          <span class="action-index">{{ i }}</span>
          <span class="action-description">
                <spec-code :code="actionsStr[i-1]"
                           @click.native="gotoAction(i-1)"
                           :class="{'clickable': true, 'tau': isTauAction(actions[i-1])}"
                           in-line></spec-code>
              </span>
        </template>
      </div>
    </simplebar>
  </el-card>
</template>

<script>
  import Simplebar from 'simplebar-vue'
  import SpecCode from '../SpecCode'
  import { formatAction } from '../../util/process-parser'
  import DisplayTraceModel from '../../models/DisplayTraceModel'
  import AtomicRenamer from '../../util/AtomicRenamer'

  export default {
    name: 'sim-trace',
    components: {
      Simplebar,
      SpecCode
    },
    data () {
      return {
        visibleActions: [],
        noActionVisible: true
      }
    },
    props: {
      actions: Array,
      currentAction: Number,
      traceLevel: String,
      atomic: {
        type: AtomicRenamer
      },
      /**
       * Determinate means that the list of action won't change.
       */
      determinate: {
        type: Boolean,
        default: false
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
        let actions = []
        let oneActionVisible = false
        let currentAction

        for (let i = 0; i < this.actions.length; i++) {
          let a = this.actions[i]
          if (i > this.currentAction) {
            currentAction = false
          } else {
            currentAction = DisplayTraceModel.isVisibleAction(a, this.traceLevel)
          }

          actions.push(currentAction)
          oneActionVisible = oneActionVisible || currentAction
        }

        // Set at the end to avoid multiple update
        this.noActionVisible = !oneActionVisible
        this.visibleActions = actions
      },
      isTauAction (action) {
        return ['tau', 'comm', 'bang', 'choice'].includes(action.type)
      },
      gotoAction (id) {
        this.$emit('goto', id)
      }
    },
    watch: {
      // Manual trigger visible actions because computed method fail to detect changes.
      traceLevel: function () {
        this.computeVisibleActions()
      },
      currentAction: function () {
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
    max-height: 50vh;
  }

  .steps-frame {
    margin-bottom: 20px;
  }
</style>

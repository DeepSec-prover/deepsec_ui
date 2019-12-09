<template>
  <code v-if="inLine" class="language-deepsec match-braces" ref="code"></code>
  <simplebar v-else class="code-block language-deepsec match-braces line-numbers">
    <pre><code ref="code"></code></pre>
  </simplebar>
</template>

<script>
import Prism from '../util/prism-deepsec'
import Simplebar from 'simplebar-vue'
import 'simplebar/dist/simplebar.min.css'
import logger from 'electron-log'
import ProcessModel from '../models/ProcessModel'

// Disable automatic highlight at page load
document.removeEventListener('DOMContentLoaded', Prism.highlightAll)

export default {
  name: 'spec-code',
  components: {
    Simplebar
  },
  props: {
    code: String,
    inLine: {
      type: Boolean,
      default: false
    },
    /**
     * List of position formatted as a string.
     */
    focusedPositions: {
      type: Array,
      default: () => []
    },
    /**
     * List of available actions objects.
     */
    availableActions: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      /**
       * Focus position computed from an available action when cursor is hover.
       */
      focusedPositionsFromActions: [],
      /**
       * Save active listeners to remove them later.
       */
      actionActiveListeners: []
    }
  },
  methods: {
    render () {
      logger.silly('Update Prism code highlight')
      if (this.code) {
        // We have to edit directly the dom to enable Prism plugins
        this.$refs.code.textContent = this.code
        Prism.highlightElement(this.$refs.code)
        // Trigger custom focus highlight
        this.setupFocus(this.focusedPositions)
        // Trigger custom clickable action
        this.setupAvailableActions()
      } else {
        // No code yet
        this.$refs.code.textContent = 'loading ...'
      }
    },
    setupFocus (positionList) {
      // Add focus to specific positions
      if (positionList && positionList.length > 0) {
        positionList.forEach(p => {
          this.$el.querySelectorAll(`.position-${p}`).forEach(e => {
            e.classList.add('focused')
          })
        })
      }
    },
    clearFocus () {
      // Clean previous focus (all of them)
      this.$el.querySelectorAll('.focused').forEach(e => {e.classList.remove('focused')})
    },
    setupAvailableActions () {
      if (this.availableActions && this.availableActions.length > 0) {
        this.availableActions.forEach(action => {
          const positionStr = ProcessModel.formatPositionToString(action.position)
          this.$el.querySelectorAll(`.position-${positionStr}`).forEach(e => {
            // Add css classes
            e.classList.add('available-action', 'clickable')

            // Click listener
            const clickAction = () => {
              const selectedAction = this.actionSelection(action)
              this.$emit('user-select-action', selectedAction)
            }
            // Keep track to remove later
            this.actionActiveListeners.push({ element: e, event: 'click', callback: clickAction })
            e.addEventListener('click', clickAction)

            // If has linked actions, add listener for focus
            if (action.tau_positions && action.tau_positions.length > 1) {
              const newPositions = action.tau_positions.map(p => ProcessModel.formatPositionToString(p))

              const mouseEnterAction = () => this.focusedPositionsFromActions = newPositions
              // Keep track to remove later
              this.actionActiveListeners.push({ element: e, event: 'mouseenter', callback: mouseEnterAction })
              e.addEventListener('mouseenter', mouseEnterAction)

              const mouseLeaveAction = () => this.focusedPositionsFromActions = []
              // Keep track to remove later
              this.actionActiveListeners.push({ element: e, event: 'mouseleave', callback: mouseLeaveAction })
              e.addEventListener('mouseleave', mouseLeaveAction)
            }
          })
        })
      }
    },
    clearAvailableActions () {
      // Remove last listeners
      this.actionActiveListeners.forEach(l => l.element.removeEventListener(l.event, l.callback))
      this.actionActiveListeners = []

      // Clean previous focus (all of them)
      this.$el.querySelectorAll('.available-action').forEach(e => {
        e.classList.remove('available-action', 'clickable')

      })
    },
    actionSelection (availableAction) {
      switch (availableAction.type) {
        case 'tau':
          return availableAction
      }
    }
  },
  watch: {
    code () {
      this.render()
    },
    focusedPositions (newVal, oldVal) {
      if (oldVal && oldVal.length > 0) {
        this.clearFocus()
      }

      this.setupFocus(this.focusedPositions)
    },
    focusedPositionsFromActions (newVal, oldVal) {
      if (oldVal && oldVal.length > 0) {
        this.clearFocus()
      }

      this.setupFocus(this.focusedPositionsFromActions)
    },
    availableActions (newVal, oldVal) {
      if (oldVal && oldVal.length > 0) {
        this.clearAvailableActions()
      }

      this.setupAvailableActions()
    }
  },
  mounted () {
    this.render()
  }
}
</script>

<style>
  .focused {
    outline: solid rgba(255, 0, 0, 0.7);
  }

  .available-action {
    outline: dashed rgba(255, 0, 0, 0.5);
  }

  .available-action:hover {
    outline: solid rgba(255, 0, 0, 0.7);
  }

  .language-deepsec .token.hidden {
    display: none;
  }

  .language-deepsec .token.in-out {
    color: lightgreen;
  }

  .language-deepsec .token.punctuation.brace-selected, .token.punctuation.brace-hover {
    /*outline: unset;*/
    outline-color: rgba(255, 255, 0, 0.50);
    color: rgba(255, 255, 0, 0.90);
    background-color: rgba(255, 255, 0, 0.25);
    font-weight: bold;
  }

  /* To avoid different line high and bad line number */
  .language-deepsec sup {
    vertical-align: top;
  }

  /* To avoid different line high and bad line number */
  .language-deepsec sub {
    vertical-align: bottom;
  }

  /* Scroll bar color */
  .code-block .simplebar-scrollbar.simplebar-visible:before {
    background-color: white;
  }
</style>

<style scoped>
  /* TODO remove horizontal scroll in <pre> for Simplebar */
  .code-block {
    max-height: 80vh; /* 80% of the window height */
  }

  pre {
    margin: 0;
  }
</style>

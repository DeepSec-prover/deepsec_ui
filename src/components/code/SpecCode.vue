<template>
  <div>
    <div class="code-block language-deepsec match-braces line-numbers scroll" :class="[codeTheme]" ref="codeDiv">
      <!-- Code Block -->
      <pre><code ref="code" ></code></pre>
    </div>
    <!-- Action selection for interactive popup -->
    <div v-show="showActionPopup && selectedAction" ref="actionPopup">
      <action-popup :action="selectedAction"
                    :atomic="atomic"
                    :dataPopper="dataPopper"
                    :isVisible="(showActionPopup && selectedAction) ? true : false"
                    :initialLeft="initialLeft"
                    @close="closeActionPopup"
                    @user-select-action="sendActionSelection"
                    @user-select-transition="selectAvailableTransitionActions"
                    @cancel="cancelActionSelection"></action-popup>
    </div>
  </div>
</template>

<script>
import Prism from '../../util/prism-deepsec'
import 'simplebar/dist/simplebar.min.css'
import logger from 'electron-log'
import ProcessModel from '../../models/ProcessModel'
import Popper from 'popper.js'
import ActionPopup from '../ActionPopup'
import lodash from 'lodash'
import AtomicRenamer from '../../util/AtomicRenamer'
import codeMixin from './code-mixin'

// Disable automatic highlight at page load
document.removeEventListener('DOMContentLoaded', Prism.highlightAll)

export default {
  name: 'spec-code',
  mixins: [codeMixin],
  components: {
    ActionPopup
  },
  props: {
    atomic: {
      type: AtomicRenamer
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
       * Save active action listeners to remove them later.
       */
      actionActiveListeners: [],
      /**
       * List of available transitions depending of the current selected action.
       */
      availableTransitions: [],
      /**
       * Save active transitions listeners to remove them later.
       */
      transitionsActiveListeners: [],
      /**
       * The selected action if waiting for transition selection.
       */
      selectedAction: null,
      /**
       * Store the transition settings selected by the user in the popup (for I/O)
       */
      transitionSettings: null,
      /**
       * Toggle the action selection popup. The same popup is used all the time.
       */
      showActionPopup: false,
      /**
       * The minimum number of lines that should be displayed.
       */
      minimumNbLines: 15,
      /**
       * The data obtained from Popper. Updated at each movement of scroll or change of window size, etc
       */
      dataPopper: null,
      /**
       * The initial left offset with respect to the left side of the code. Usefull when the
       * trace and frame are on the left side of the process.
       */
      initialLeft: 0
    }
  },
  /**
   * @see flow/user_action_selection.svg for detail about actions ordering.
   */
  methods: {
    /**
     * Enable CSS for visually show focused positions.
     *
     * @param {String[]} positionList The list of code positions formatted as string.
     */
    setupFocus (positionList) {
      if (positionList && positionList.length > 0) {
        // Add focus to specific positions
        positionList.forEach(p => {
          this.$el.querySelectorAll(`.position-${p}`).forEach(e => { e.classList.add('focused') })
        })
      }
    },
    /**
     * Remove any previously set CSS for focused positions.
     */
    clearFocus () {
      // Clean previous focus (all of them)
      this.$el.querySelectorAll('.focused').forEach(e => { e.classList.remove('focused') })
    },
    /**
     * Enable CSS and listeners for available user action.
     * Allow the user to click on any available position to execute it.
     */
    setupAvailableActions () {
      if (this.availableActions && this.availableActions.length > 0) {
        this.availableActions.forEach(action => {
          const positionStr = ProcessModel.formatPositionToString(action.position)
          this.$el.querySelectorAll(`.position-${positionStr}`).forEach(e => {
            // Add css classes
            e.classList.add('available-action', 'clickable')

            // Click listener
            const clickAction = () => { this.actionSelection(action, e) }
            // Keep track to remove later
            this.actionActiveListeners.push({ element: e, event: 'click', callback: clickAction })
            e.addEventListener('click', clickAction)

            // If has linked actions, add listener for focus
            if (action.tau_positions && action.tau_positions.length > 1) {
              const newPositions = action.tau_positions.map(p => ProcessModel.formatPositionToString(p))

              const mouseEnterAction = () => { this.focusedPositionsFromActions = newPositions }
              // Keep track to remove later
              this.actionActiveListeners.push({ element: e, event: 'mouseenter', callback: mouseEnterAction })
              e.addEventListener('mouseenter', mouseEnterAction)

              const mouseLeaveAction = () => { this.focusedPositionsFromActions = [] }
              // Keep track to remove later
              this.actionActiveListeners.push({ element: e, event: 'mouseleave', callback: mouseLeaveAction })
              e.addEventListener('mouseleave', mouseLeaveAction)
            }
          })
        })
      }
    },
    /**
     * Remove any previously set CSS and listeners for available user action.
     */
    clearAvailableActions () {
      // Remove last listeners
      this.actionActiveListeners.forEach(l => { l.element.removeEventListener(l.event, l.callback) })
      this.actionActiveListeners = []

      // Clean previous focus (all of them)
      this.$el.querySelectorAll('.available-action').forEach(e => {
        e.classList.remove('available-action', 'clickable')
      })
    },
    /**
     * Enable CSS and listeners for available transitions.
     * Which are actions available as a transition of the previous I/O action.
     * Allow the user to click on any available transitions to execute it.
     */
    setupAvailableTransitions () {
      if (this.availableTransitions && this.availableTransitions.length > 0) {
        this.availableTransitions.forEach(transition => {
          const positionStr = ProcessModel.formatPositionToString(transition.position)
          this.$el.querySelectorAll(`.position-${positionStr}`).forEach(e => {
            // Add css classes
            e.classList.add('available-transitions', 'clickable')

            const clickAction = () => { this.transitionSelection(transition) }
            // Keep track to remove later
            this.transitionsActiveListeners.push({ element: e, event: 'click', callback: clickAction })
            e.addEventListener('click', clickAction)
          })
        })
      }
    },
    /**
     * Remove any previously set CSS and listeners for available transition action.
     */
    clearAvailableTransitions () {
      if (this.transitionsActiveListeners && this.transitionsActiveListeners.length > 0) {
        // Remove last listeners
        this.transitionsActiveListeners.forEach(l => { l.element.removeEventListener(l.event, l.callback) })
        this.transitionsActiveListeners = []

        // Clean previous focus (all of them)
        this.$el.querySelectorAll('.available-transitions').forEach(e => {
          e.classList.remove('available-transitions', 'clickable')
        })
      }
    },
    /**
     * Trigger the appropriate code depending of the selected action type.
     * Could send the action or open a popup to ask more information to the user.
     *
     * @param {Object} availableAction The action that the user just select.
     * @param {Element} domElement The DOM element which directly include the action string. Used for popup position.
     */
    actionSelection (availableAction, domElement) {
      const type = availableAction.type

      if (type === 'tau') {
        // No change needed, send the action to the API.
        this.sendActionSelection(availableAction)
      } else if (type === 'output' || type === 'input' | type === 'bang') {
        // Display a popup to ask more information.
        this.displayActionSelectorPopup(availableAction, domElement)
      } else if (type === 'choice') {
        this.selectAvailableChoice(availableAction)
      } else {
        logger.error(`Not implemented action type ${type}`)
      }
    },
    /**
     * Trigger the appropriate code depending of the transition type and action selection.
     * Always send an answer to the API.
     *
     * @param {Object} selectedTransition The transition action which the user just select.
     */
    transitionSelection (selectedTransition) {
      if (this.selectedAction.type === 'choice') {
        this.sendActionSelection(
          {
            type: 'choice',
            position: this.selectedAction.position,
            choose_left: selectedTransition.position.tag === 'left'
          })
      } else {
        let input, output
        if (this.selectedAction.type === 'input') {
          input = this.selectedAction
          output = selectedTransition
        } else {
          input = selectedTransition
          output = this.selectedAction
        }

        if (this.transitionSettings.type === 'comm') {
          this.sendActionSelection(
            {
              type: 'comm',
              input_position: input.position,
              output_position: output.position
            })
        } else if (this.transitionSettings.type === 'eavesdrop') {
          this.sendActionSelection(
            {
              type: 'eavesdrop',
              input_position: input.position,
              output_position: output.position,
              channel: this.selectedAction.channel
            })
        } else {
          logger.error(`Invalid transition selection type ${this.transitionSettings.type}`)
        }
      }
    },
    /**
     * Filter and focus available transition actions depending of the previously selected action and the transition settings.
     *
     * @param {Object} transition The selected transition settings.
     */
    selectAvailableTransitionActions (transition) {
      this.transitionSettings = transition
      const filterType = this.selectedAction.type === 'input' ? 'output' : 'input'
      const filterTransitionType = transition.type
      const filterChannel = this.selectedAction.channel

      // Filter the available transition action for the current available action list.
      this.availableTransitions = this.availableActions.filter(a => {
        return a.type === filterType &&
          a.transitions.some(t => t.type === filterTransitionType) &&
          lodash.isEqual(a.channel, filterChannel) // Full object content value comparison
      })

      // Show available transitions
      this.setupAvailableTransitions()
    },
    /**
     * Filter and focus available transition actions depending of the previously selected choice.
     *
     * @param {Object} choiceAction The selected choice.
     */
    selectAvailableChoice (choiceAction) {
      // Hide previous available actions
      this.clearAvailableActions()
      this.clearFocus()
      // Save current action
      this.selectedAction = choiceAction
      // Focus on this action
      this.setupFocus([ProcessModel.formatPositionToString(this.selectedAction.position)])

      this.availableTransitions = [
        {
          type: 'choice',
          position: {
            index: choiceAction.position.index,
            args: choiceAction.position.args,
            tag: 'left'
          }
        },
        {
          type: 'choice',
          position: {
            index: choiceAction.position.index,
            args: choiceAction.position.args,
            tag: 'right'
          }
        }
      ]

      // Show available transitions
      this.setupAvailableTransitions()
    },
    /**
     * Retrieve the elements required to compute the offsets of dialog-drag.
     * @param {Object} dataObject The data used by Popper.
     */
    setupDataPopper (data) {
      // Test require in equivalence simulator when we swap from one process to
      // another. The popper of the first spec code is alive but the div is not
      // referenced.
      if (this.$refs.codeDiv) {
        this.dataPopper = {
          top: Math.floor(data.popper.top),
          left: Math.floor(data.popper.left),
          widthWindow: this.$refs.codeDiv.clientWidth,
          heightWindow: this.$refs.codeDiv.clientHeight
        }
      } else {
        this.dataPopper = {
          top: Math.floor(data.popper.top),
          left: Math.floor(data.popper.left),
          widthWindow: 0,
          heightWindow: 0
        }
      }

    },
    /**
     * Display the action selector popup to ask more information to the user.
     *
     * @param {Object} action The action for which we want to display the popup.
     * @param {Element} domElement The DOM element which directly include the action string. Used for popup position.
     */
    displayActionSelectorPopup (action, domElement) {
      // Hide previous available actions
      this.clearAvailableActions()
      this.clearFocus()
      // Save current action
      this.selectedAction = action
      // Focus on this action
      this.setupFocus([ProcessModel.formatPositionToString(this.selectedAction.position)])

      new Popper(domElement, this.$refs.actionPopup, {
        placement: 'bottom-start', // Important to keep bottom-start for the calculus of dataPopper.
        strategy: 'fixed',
        onUpdate: (data) => {
          this.setupDataPopper(data)
          Popper.Defaults.onUpdate(data)
        },
        onCreate: this.setupDataPopper
       })

      this.showActionPopup = true
    },
    /**
     * Close the action popup selection
     */
    closeActionPopup () {
      this.showActionPopup = false
    },
    /**
     * Send the "user-select-action" signal to the parent.
     *
     * @param {Object} action The action selected by the user and formatted as a proper API command.
     */
    sendActionSelection (action) {
      this.resetUserSelection()

      this.$emit('user-select-action', action)
    },
    /**
     * Cancel the action transition selection, go back to action selection state.
     */
    cancelActionSelection () {
      this.closeActionPopup()
      this.resetUserSelection()
      this.setupAvailableActions()
    },
    /**
     * Remove current user selection, visual focus and listeners.
     */
    resetUserSelection () {
      // Reset visual
      this.clearAvailableTransitions()
      this.clearAvailableActions()
      this.clearFocus()

      // Reset values
      this.selectedAction = null
      this.transitionSettings = null
    }
  },
  watch: {
    code (newVal, oldVal) {
      if (oldVal) {
        this.resetUserSelection()
      }
      this.render()
      // Trigger custom focus highlight
      this.setupFocus(this.focusedPositions)
      // Trigger custom clickable action
      this.setupAvailableActions()
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
  /**
   * Called after the mixin hook
   */
  mounted () {
    // Trigger custom focus highlight
    this.setupFocus(this.focusedPositions)
    // Trigger custom clickable action
    this.setupAvailableActions()
    new Popper(this.$refs.codeDiv, this.$refs.actionPopup, {
      placement: 'bottom-start', // Important to keep bottom-start for the calculus of initialLeft
      strategy: 'fixed',
      onCreate: (data) => {
        this.initialLeft = Math.floor(data.popper.left)
      }
     })
    /* TODO When i try to destroy the popper after it was created using destroy(),
       the function onCreate is not called as if it was destroy before it had the
       time to be created.
    */
  }
}
</script>

<style scoped>
  /* TODO remove horizontal scroll in <pre> for Simplebar */
  .code-block {
    max-height: 90vh; /* 90% of the window height */
    margin-bottom: 15px;
  }
  .scroll{
    overflow: scroll !important;
  }

  pre {
    margin: 0;
  }
</style>

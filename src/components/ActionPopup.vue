<template>
  <dialog-drag :options="options" class="popup" @drag-end="setOffset" >
  <div ref="dragBox">
    <el-form v-if="action" size="mini">
      <!-- Bang -->
      <template v-if="action.type === 'bang'">
        <el-form-item v-if="action.max_unfolding > 1" label="Nb unfolded">
          <el-input-number v-model="nbProcessUnfolded" :min="1" :max="action.max_unfolding"></el-input-number>
        </el-form-item>
        <div v-else>Unfold 1</div>
      </template>
      <!-- I/O -->
      <template v-else-if="action.type === 'input' || action.type === 'output'">
        <div class="centred-content" :class="{'not-clickable': onlyOneType}">
          <el-radio-group size="mini" v-model="selectedTransitionType">
            <el-radio-button v-if="transitionTypes.includes('direct')" label="direct">Direct</el-radio-button>
            <el-radio-button v-if="transitionTypes.includes('comm')" label="comm">Communication</el-radio-button>
            <el-radio-button v-if="transitionTypes.includes('eavesdrop')" label="eavesdrop">Eavesdrop</el-radio-button>
          </el-radio-group>
        </div>
        <!-- Channel -->
        <template v-if="selectedTransitionType === 'direct' || selectedTransitionType === 'eavesdrop'">
          <div class="recipe-label">Channel's recipe:</div>
          <recipe-input v-model="recipes[selectedTransitionType].recipe_channel"
                        :locked="recipes[selectedTransitionType].locked"
                        @input="checkRecipes"></recipe-input>
        </template>
        <!-- Term -->
        <template v-if="selectedTransitionType === 'direct' && action.type === 'input'">
          <div class="recipe-label">Term's recipe:</div>
          <recipe-input v-model="recipes[selectedTransitionType].recipe_term"
                        :locked="recipes[selectedTransitionType].locked"
                        @input="checkRecipes"></recipe-input>
        </template>
      </template>
      <!-- Buttons -->
      <div class="buttons">
        <span>
          <el-button size="mini" type="info" @click="$emit('cancel')" plain>
            Cancel
          </el-button>
        </span>
        <span>
          <el-button class="validate" size="mini" type="success" @click="validate" :plain="!finalAction"
                     :disabled="!validRecipes">
            {{ finalAction ? 'Validate' : 'Continue'}}
          </el-button>
        </span>
      </div>
    </el-form>
  </div>
  </dialog-drag>
</template>

<script>
import RecipeInput from './RecipeInput'
import { formatCode } from '../util/process-parser'
import AtomicRenamer from '../util/AtomicRenamer'
import { isEmptyOrBlankStr } from '../util/misc'
import Vue from 'vue'
import ProcessModel from '../models/ProcessModel'
import DialogDrag from 'vue-dialog-drag'
import 'vue-dialog-drag/dist/vue-dialog-drag.css'

export default {
  name: 'action-popup',
  components: { RecipeInput, DialogDrag },
  props: {
    action: {
      type: Object, // Type available_action_structure
      require: true
    },
    atomic: {
      type: AtomicRenamer,
      require: true
    },
    dataPopper: {
      type: Object
    },
    isVisible: {
      type: Boolean,
      require: true
    },
    initialLeft: {
      type: Number,
      require: true
    }
  },
  data () {
    return {
      selectedTransitionType: null,
      recipes: {},
      nbProcessUnfolded: 1,
      validRecipes: false,
      cacheRecipes: new Map(),
      dataDrag: null,
      options: { buttonPin: false, buttonClose: false, left: 0, top: 0, dragCursor: '-moz-grab'},
      marginDragBot: 25,
      marginDragTop: 5,
      marginDragLeft: 15,
      marginDragRight: 25,
    }
  },
  computed: {
    sizeOfFrame: function () {
      if (this.isVisible) {
        return { width: this.$refs.dragBox.clientWidth, height : this.$refs.dragBox.clientHeight  }
      } else {
        return { width: 0, height: 0 }
      }
    },
    transitionTypes: function () {
      return this.action.transitions.map(t => t.type)
    },
    onlyOneType: function () {
      return this.action.transitions.length === 1
    },
    finalAction: function () {
      return this.selectedTransitionType === 'direct' || this.action.type === 'bang'
    }
  },
  methods: {
    setOffset (data) {
      this.dataDrag = {
        left: data.left,
        top: data.top
      }
      let options = this.options
      this.reconfigure (this.dataPopper,this.dataDrag,options)
      this.options = Object.assign({},options)
        // Seems that just updating the value of options does not work. Creating
        // a completely new option seems to trigger an update correctly.
        // Trick obtained on Github by the creator of dialog-drag
    },
    reconfigure (dataPopper,dataDrag,options) {
      if (!dataDrag) {
        dataDrag = { left: 0, top: 0 }
        this.dataDrag = { left: 0, top: 0 }
      }

      if (dataPopper.top + dataDrag.top < this.marginDragTop) {
        options.top = this.marginDragTop - dataPopper.top
      } else if (dataPopper.top + dataDrag.top + this.sizeOfFrame.height > dataPopper.heightWindow - this.marginDragBot) {
        options.top = dataPopper.heightWindow - this.marginDragBot - this.sizeOfFrame.height - dataPopper.top
      } else {
        options.top = dataDrag.top
      }
      if (dataPopper.left + dataDrag.left < this.initialLeft + this.marginDragLeft) {
        options.left = this.initialLeft + this.marginDragLeft - dataPopper.left
      } else if (dataPopper.left + dataDrag.left + this.sizeOfFrame.width > dataPopper.widthWindow + this.initialLeft - this.marginDragRight) {
        options.left = this.initialLeft + dataPopper.widthWindow - this.marginDragRight - dataPopper.left - this.sizeOfFrame.width
      } else {
        options.left = dataDrag.left
      }
    },
    validate () {
      if (this.action.type === 'bang') {
        this.$emit('user-select-action', {
          type: 'bang',
          position: this.action.position,
          nb_process_unfolded: this.nbProcessUnfolded
        })
      }
      // type I/O
      else {
        if (this.selectedTransitionType === 'direct') {
          this.$emit('user-select-action', {
            type: this.action.type,
            position: this.action.position,
            channel: this.recipes[this.selectedTransitionType].recipe_channel,
            term: this.recipes[this.selectedTransitionType].recipe_term
          })
        } else {
          this.$emit('user-select-transition', {
            type: this.selectedTransitionType,
            channel: this.recipes[this.selectedTransitionType].recipe_channel
          })
        }
      }
      this.$emit('close')
    },
    checkRecipes () {
      if (this.selectedTransitionType === 'direct') {
        if (this.action.type === 'input') {
          this.validRecipes = !isEmptyOrBlankStr(this.recipes[this.selectedTransitionType].recipe_channel) &&
            !isEmptyOrBlankStr(this.recipes[this.selectedTransitionType].recipe_term)
        } else { // output
          this.validRecipes = !isEmptyOrBlankStr(this.recipes[this.selectedTransitionType].recipe_channel)
        }
      } else if (this.selectedTransitionType === 'eavesdrop') {
        this.validRecipes = !isEmptyOrBlankStr(this.recipes[this.selectedTransitionType].recipe_channel)
      } else {
        this.validRecipes = true // everything else have no recipe
      }
    }
  },
  watch: {
    action (newVal, oldVal) {
      // When the popup is closed
      if (newVal === null && oldVal) {
        // Save the current recipes in the cache
        this.cacheRecipes.set(ProcessModel.formatPositionToString(oldVal.position), this.recipes)
      }
      // Only update if some new value is set
      else if (newVal) {
        // Set default value for selected transition type
        if (this.action.transitions) {
          if (this.transitionTypes.includes('direct')) {
            this.selectedTransitionType = 'direct'
          } else if (this.transitionTypes.includes('comm')) {
            this.selectedTransitionType = 'comm'
          } else if (this.transitionTypes.includes('eavesdrop')) {
            this.selectedTransitionType = 'eavesdrop'
          }

          const positionStr = ProcessModel.formatPositionToString(newVal.position)
          // If possible load from cache, else get default values
          if (this.cacheRecipes.has(positionStr)) {
            this.recipes = this.cacheRecipes.get(positionStr)
          } else {
            this.recipes = []
            this.action.transitions.forEach(t => {
              Vue.set(this.recipes, t.type, {}) // Use vue.set for reactivity
              if (t.recipe_channel) {
                this.recipes[t.type].recipe_channel = formatCode(t.recipe_channel, this.atomic)
              } else {
                this.recipes[t.type].recipe_channel = ''
              }

              if (t.recipe_term) {
                this.recipes[t.type].recipe_term = formatCode(t.recipe_term, this.atomic)
              } else {
                this.recipes[t.type].recipe_term = ''
              }

              this.recipes[t.type].locked = t.locked
            })
          }
        } else {
          this.selectedTransitionType = null
        }
        this.checkRecipes()
      }
    },
    selectedTransitionType () {
      this.checkRecipes()
    },
    dataPopper (newVal, _) {
      let options = this.options
      this.reconfigure(newVal,this.dataDrag,options)
      this.options = Object.assign({},options)
    },
    isVisible (bool) {
      if (!bool) {
        this.dataDrag = { top: 0, left: 0 }
      }
    }
  }
}
</script>

<style>
  .not-clickable .el-radio-button__inner {
    cursor: default;
  }

  .dialog-drag {
    cursor: move;
    cursor: -webkit-grab;
    width: max-content;
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .2);
  }

  .dialog-drag .dialog-header {
    display: none;
  }

  .dialog-drag .dialog-body {
    padding: 0.5em;
  }
</style>

<style scoped>
  .validate {
    margin-left: 6px;
    float: right;
  }

  .buttons {
    padding-top: 8px;
  }

  .recipe-label {
    font-size: 90%;
    line-height: 22px !important;
  }
</style>

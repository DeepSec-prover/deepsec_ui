<template>
  <dialog-drag :options="{buttonPin: false, buttonClose: false, left: 0, top: 0}" class="popup">
    <el-form v-if="action" size="mini" v-on:submit.prevent.native>
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
          <el-button size="mini"
                     type="info"
                     @click="$emit('cancel')"
                     v-shortkey="['esc']"
                     @shortkey.native="$emit('cancel')"
                     plain>
            Cancel
          </el-button>
        </span>
        <span>
          <el-button class="validate" size="mini" type="success" @click="validate" :plain="!finalAction"
                     :disabled="!validRecipes"
                     v-shortkey="['enter']"
                     @shortkey.native="validate">
            {{ finalAction ? 'Validate' : 'Continue'}}
          </el-button>
        </span>
      </div>
    </el-form>
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
    }
  },
  data () {
    return {
      selectedTransitionType: null,
      recipes: {},
      nbProcessUnfolded: 1,
      validRecipes: false,
      cacheRecipes: new Map()
    }
  },
  computed: {
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
    validate () {
      if (!this.validRecipes) {
        return // Do nothing (could happen with shortcut)
      }

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
    }
  }
}
</script>

<style>
  .not-clickable .el-radio-button__inner {
    cursor: default;
  }

  .dialog-drag {
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

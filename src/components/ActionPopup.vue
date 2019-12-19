<template>
  <el-card class="popup">
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
  </el-card>
</template>

<script>
import RecipeInput from './RecipeInput'
import { formatCode } from '../util/process-parser'
import AtomicRenamer from '../util/AtomicRenamer'
import { isEmptyOrBlankStr } from '../util/misc'
import Vue from 'vue'

export default {
  name: 'action-popup',
  components: { RecipeInput },
  props: {
    action: {
      type: Object,
      require: true
    },
    atomic: {
      type: AtomicRenamer,
      require: true
    }
  },
  data () {
    return {
      selectedTransitionType: 'direct',
      recipes: {},
      nbProcessUnfolded: 1,
      validRecipes: false
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
    action (newVal, _) {
      // Only update if some new value is set
      if (newVal) {
        // Set default value for selected transition type
        if (this.action.transitions) {
          if (this.transitionTypes.includes('direct')) {
            this.selectedTransitionType = 'direct'
          } else if (this.transitionTypes.includes('comm')) {
            this.selectedTransitionType = 'comm'
          } else if (this.transitionTypes.includes('eavesdrop')) {
            this.selectedTransitionType = 'eavesdrop'
          }

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
  .popup .el-card__body {
    padding: 6px;
  }

  .popup .el-form-item {
    margin-bottom: 8px !important;
  }

  .not-clickable .el-radio-button__inner {
    cursor: default;
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

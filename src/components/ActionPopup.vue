<template>
  <el-card class="popup">
    <el-form v-if="action" size="mini">
      <!-- Bang -->
      <template v-if="action.type === 'bang'">
        <el-form-item label="Nb unfolded">
          <el-input-number v-model="nbProcessUnfolded" :min="1" :max="action.max_unfolding"></el-input-number>
        </el-form-item>
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
        <el-form-item v-show="selectedTransitionType === 'direct' || selectedTransitionType === 'eavesdrop'"
                      label="Channel :">
          <el-input v-model="channelRecipe" placeholder="recipe"></el-input>
        </el-form-item>
        <el-form-item v-show="selectedTransitionType === 'direct'"
                      label="Term :">
          <el-input v-model="termRecipe" placeholder="recipe"></el-input>
        </el-form-item>
      </template>
      <!-- Buttons -->
      <div class="buttons">
        <span>
          <el-button size="mini" type="info" @click="$emit('cancel')" plain>
            Cancel
          </el-button>
        </span>
        <span>
          <el-button class="validate" size="mini" type="success" @click="validate" plain>
            {{ selectedTransitionType === 'direct' ? 'Validate' : 'Continue'}}
          </el-button>
        </span>
      </div>
    </el-form>
  </el-card>
</template>

<script>
export default {
  name: 'action-popup',
  props: {
    action: {
      type: Object,
      require: true
    }
  },
  data () {
    return {
      selectedTransitionType: 'direct',
      nbProcessUnfolded: 1,
      channelRecipe: '',
      termRecipe: ''
    }
  },
  computed: {
    transitionTypes: function () {
      return this.action.transitions.map(t => t.type)
    },
    onlyOneType: function () {
      return this.action.transitions.length === 1
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
            position: this.action.position
          })
        } else {
          this.$emit('user-select-transition', {
            type: this.selectedTransitionType,
            channel: this.channelRecipe,
            term: this.termRecipe
          })
        }
      }
      this.$emit('close')
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
        }
      }
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

  .popup .el-form-item__label {
    font-size: 90%;
    line-height: 22px !important;
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
</style>

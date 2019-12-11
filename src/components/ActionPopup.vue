<template>
  <el-card id="popup">
    <el-form v-if="action" size="mini">
      <!-- Bang -->
      <template v-if="action.type === 'bang'">
        <el-form-item label="Nb unfolded">
          <el-input-number v-model="nbProcessUnfolded" :min="1" :max="action.max_unfolding"></el-input-number>
        </el-form-item>
      </template>
      <!-- I/O -->
      <template v-else-if="action.type === 'input' || action.type === 'output'">
        <el-radio-group v-model="selectedTransitionType" :disabled="transitionTypes.length === 1">
          <el-radio-button v-if="transitionTypes.includes('direct')" label="direct">Direct</el-radio-button>
          <el-radio-button v-if="transitionTypes.includes('comm')" label="comm">Communication</el-radio-button>
          <el-radio-button v-if="transitionTypes.includes('eavesdrop')" label="eavesdrop">Eavesdrop</el-radio-button>
        </el-radio-group>
        <el-form-item v-show="selectedTransitionType === 'direct' || selectedTransitionType === 'eavesdrop'"
                      label="Channel :">
          <el-input v-model="channelRecipe" placeholder="recipe"></el-input>
        </el-form-item>
        <el-form-item v-show="selectedTransitionType === 'direct'"
                      label="Term :">
          <el-input v-model="termRecipe" placeholder="recipe"></el-input>
        </el-form-item>
      </template>
      <!-- Validate -->
      <el-button @click="validate">Validate</el-button>
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

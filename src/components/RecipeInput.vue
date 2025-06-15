<template>
  <div>
    <el-input v-if="!locked" ref="input" class="recipe-input" v-show="editionEnable" v-model="recipe" placeholder="recipe"
              @input="inputChange" @keyup.native.enter="validateInput"></el-input>
    <spec-code-inline :class="{'editable-code': !locked}" @click.native="codeClick" v-show="!editionEnable" :code="recipe"></spec-code-inline>
    <span v-if="!locked" class="edit-button">
      <el-link @click="clickEdit" :icon="editionEnable ? 'el-icon-check' : 'el-icon-edit'"></el-link>
      <helper class="helper-icon" helper-id="recipes" v-if="editionEnable && helperEnabled" text-content>
        <i class="el-icon-question"></i>
      </helper>
    </span>
  </div>
</template>

<script>
import SpecCodeInline from './code/SpecCodeInline'
import Helper from './helpers/Helper'
import defaultValues from '../util/default-values'

export default {
  name: 'recipe-input',
  components: {
    SpecCodeInline,
    Helper
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    locked: {
      type: Boolean,
      default: true
    }
  },
   data () {
    return {
      editionEnable: false,
      recipe: String,
      helperEnabled: defaultValues.showHelpers
    }
  },
  methods: {
    inputChange ($event) {
      this.$emit('input', $event)
    },
    clickEdit () {
      this.editionEnable = !this.editionEnable

      if (this.editionEnable) {
        this.$nextTick(() => {
          this.$refs.input.focus()
          this.$emit('popper-to-update')
        })
      }
    },
    codeClick () {
      if (!this.locked) {
        this.editionEnable = true

        this.$nextTick(() => {
          this.$refs.input.focus()
          this.$emit('popper-to-update')
        })
      }
    },
    validateInput (event) {
      this.editionEnable = false
      this.$nextTick(() => {
        this.$emit('popper-to-update')
      })
    }
  },
  watch: {
    value () {
      // Reset recipe when default value change
      this.recipe = this.value
    }
  },
  beforeMount () {
    this.recipe = this.value
  }
}
</script>

<style scoped>
  .edit-button {
    padding: 0 5px;
  }

  .helper-icon {
    opacity: 0.5;
    margin-left: 3px;
  }

  .recipe-input {
    width: auto;
  }

  .editable-code {
    cursor: text;
  }
</style>

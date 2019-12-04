<!-- This component is a fork of the Element Upload List component -->
<!-- node_modules/element-ui/packages/upload/src/upload-list.vue -->
<template>
  <transition-group tag="ul" :class="[ 'el-upload-list', 'el-upload-list--text', { 'is-disabled': disabled } ]" name="el-list"
                    :duration="{ leave: 100 }">
    <li v-for="file in files"
        :class="['el-upload-list__item', focusing ? 'focusing' : '']"
        :key="file"
        @keydown.delete="!disabled && $emit('remove', file)"
        @focus="focusing = true"
        @blur="focusing = false"
        @click="focusing = false"
    >
      <slot :file="file">
        <a class="el-upload-list__item-name" @click="handleClick(file)">
          <i class="el-icon-document"></i>{{ fileName(file) }}
        </a>
        <i class="el-icon-close" v-if="!disabled" @click="$emit('remove', file)"></i>
      </slot>
    </li>
  </transition-group>
</template>

<script>
import ElProgress from 'element-ui/packages/progress'
import SpecFileMixin from './spec-files-mixin'

export default {
  name: 'files-list',
  mixins: [SpecFileMixin],
  data () {
    return {
      focusing: false
    }
  },
  components: { ElProgress },
  props: {
    files: {
      type: Array,
      default () {
        return []
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick (file) {
      this.handlePreview && this.handlePreview(file)
    }
  }
}
</script>

<style scoped>
  li.el-upload-list__item {
    max-width: 300px !important;
  }
</style>

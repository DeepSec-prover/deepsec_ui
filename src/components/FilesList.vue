<!-- This component is a fork of the Element Upload List component -->
<!-- node_modules/element-ui/packages/upload/src/upload-list.vue -->
<template>
  <transition-group tag="ul" :class="[ 'el-upload-list', 'el-upload-list--text', { 'is-disabled': disabled } ]" name="el-list">
    <li
      v-for="file in files"
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
        <label class="el-upload-list__item-status-label">
          <i :class="['el-icon-upload-success', 'el-icon-circle-check']"></i>
        </label>
        <i class="el-icon-close" v-if="!disabled" @click="$emit('remove', file)"></i>
        <!--        <i class="el-icon-close-tip" v-if="!disabled">{{ t('el.upload.deleteTip') }}</i>-->
      </slot>
    </li>
  </transition-group>
</template>
<script>
  import ElProgress from 'element-ui/packages/progress'
  import path from 'path'

  export default {
    name: 'files-list',

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
      },
      fileName (filePath) {
        return path.basename(filePath).replace(/\.dps$/ui, '')
      }
    }
  }
</script>

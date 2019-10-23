<template>
  <el-tag v-if="tag" size="medium" effect="dark" :type="type[status]">
    <i :class="icons[status]"></i>
    {{ text.status[status] }}
  </el-tag>
  <i v-else :class="[icons[status], 'color-' + status]"></i>
</template>

<script>
  import text from '../../text-content/text'

  export default {
    name: 'result-status',
    props: {
      /**
       * The status to show
       */
      status: String,
      /**
       * Use tag instead of icon only.
       */
      tag: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        icons: {
          waiting: 'el-icon-video-pause',
          in_progress: 'el-icon-loading',
          completed: 'el-icon-circle-check',
          internal_error: 'el-icon-circle-close',
          canceled: 'el-icon-warning-outline'
        },
        type: {
          waiting: 'info',
          in_progress: '',
          completed: 'success',
          internal_error: 'danger',
          canceled: 'warning'
        },
        text: text
      }
    }
  }
</script>

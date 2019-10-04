<template>
  <el-tooltip :content="helperContent(helperId)"
              :placement="helper.placement"
              :effect="helper.effect"
              :open-delay="helper.openDelay"
              :disabled="helper.disable">
    <slot></slot>
  </el-tooltip>
</template>

<script>
  import helpersMixin from './helpers-mixin'

  export default {
    name: 'helper',
    mixins: [helpersMixin]
  }
</script>

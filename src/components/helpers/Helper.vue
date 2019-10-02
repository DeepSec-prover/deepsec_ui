<template>
  <el-tooltip :content="helperContent(helperId)"
              :placement="helper.placement"
              :effect="helper.effect"
              :open-delay="helper.openDelay">
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

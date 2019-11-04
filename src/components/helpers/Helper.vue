<template>
  <el-tooltip :placement="helper.placement"
              :effect="helper.effect"
              :open-delay="helper.openDelay"
              :disabled="helper.disable">
    <div slot="content" v-html="helperContent"></div>
    <!-- If text add span and class for cursor -->
    <span v-if="textContent" :class="{'label-helper' : !helper.disable}">
      <slot></slot>
    </span>
    <slot v-else></slot>
  </el-tooltip>
</template>

<script>
  import helpersMixin from './helpers-mixin'

  export default {
    name: 'helper',
    mixins: [helpersMixin],
    props: {
      textContent: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

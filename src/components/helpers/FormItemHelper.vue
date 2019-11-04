<template>
  <el-form-item>
    <!-- Label with helper tooltip -->
    <template v-slot:label>
      <el-tooltip :placement="helper.placement"
                  :effect="helper.effect"
                  :open-delay="helper.openDelay"
                  :disabled="helper.disable"
                  :tabindex="-1">
        <div slot="content" v-html="helperContent"></div>
        <span :class="{'label-helper' : !helper.disable}">{{ label }}</span>
      </el-tooltip> :
    </template>
    <!-- Input field -->
    <slot></slot>
  </el-form-item>
</template>

<script>
  import helpersMixin from './helpers-mixin'

  export default {
    name: 'form-item-helper',
    mixins: [helpersMixin],
    props: {
      label: {
        type: String
      }
    }
  }
</script>

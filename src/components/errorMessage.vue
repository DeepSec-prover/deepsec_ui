<template>
<span>
  <template v-for="(part, index) in msgParts">
    <template v-if="index % 2 === 0">
      {{ part }}
    </template>
    <template v-else>
      <spec-code-inline :code="part"></spec-code-inline>
    </template>
  </template>
</span>
</template>

<script>
import SpecCodeInline from './code/SpecCodeInline'

export default {
  name: 'errorMessage',
  components: { SpecCodeInline },
  props: {
    /**
     * Error message formatted as : "some text %some code% some test ..."
     */
    msg: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      msgParts: []
    }
  },
  beforeMount () {
    this.msgParts = this.msg.split('%') // Split '%' to find the code section
  }
}
</script>

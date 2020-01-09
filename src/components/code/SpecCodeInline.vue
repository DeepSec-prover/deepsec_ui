<template>
  <code class="inline-code language-deepsec match-braces" ref="code" :class="[codeTheme]"></code>
</template>

<script>
import codeMixin from './code-mixin'

export default {
  name: 'spec-code-inline',
  mixins: [codeMixin],
  watch: {
    code () {
      this.render()
    }
  }
}
</script>

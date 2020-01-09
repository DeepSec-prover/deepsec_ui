<template>
  <code class="language-deepsec match-braces" ref="code"></code>
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

<template>
  <code v-if="inLine" class="language-deepsec match-braces" ref="code"></code>
  <simplebar v-else class="code-block language-deepsec match-braces line-numbers">
    <pre><code ref="code"></code></pre>
  </simplebar>
</template>

<script>
import Prism from '../util/prism-deepsec'
import Simplebar from 'simplebar-vue'
import 'simplebar/dist/simplebar.min.css'
import logger from 'electron-log'

// Disable automatic highlight at page load
document.removeEventListener('DOMContentLoaded', Prism.highlightAll)

export default {
  name: 'spec-code',
  components: {
    Simplebar
  },
  props: {
    code: String,
    inLine: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    render () {
      logger.silly('Update Prism code highlight')
      if (this.code) {
        // We have to edit directly the dom to enable Prism plugins
        this.$refs.code.textContent = this.code
        Prism.highlightElement(this.$refs.code)
      } else {
        // No code yet
        this.$refs.code.textContent = 'loading ...'
      }
    }
  },
  watch: {
    code () {
      this.render()
    }
  },
  mounted () {
    this.render()
  }
}
</script>

<style>
  .language-deepsec .token.hidden {
    display: none;
  }

  .language-deepsec .token.in-out {
    color: lightgreen;
  }

  .language-deepsec .token.punctuation.brace-selected, .token.punctuation.brace-hover {
    /*outline: unset;*/
    outline-color: rgba(255, 255, 0, 0.50);
    color: rgba(255, 255, 0, 0.90);
    background-color: rgba(255, 255, 0, 0.25);
    font-weight: bold;
  }

  /* To avoid different line high and bad line number */
  .language-deepsec sup {
    vertical-align: top;
  }

  /* To avoid different line high and bad line number */
  .language-deepsec sub {
    vertical-align: bottom;
  }

  /* Scroll bar color */
  .code-block .simplebar-scrollbar.simplebar-visible:before {
    background-color: white;
  }
</style>

<style scoped>
  /* TODO remove horizontal scroll in <pre> for Simplebar */
  .code-block {
    max-height: 80vh; /* 80% of the window height */
  }

  pre {
    margin: 0;
  }
</style>

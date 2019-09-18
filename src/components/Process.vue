<template>
  <div class="language-deepsec line-numbers match-braces">
    <pre><code ref="codeBlock"></code></pre>
  </div>
</template>

<script>
  import Prism from '@/util/prism-deepsec'
  import logger from 'electron-log'

  // Disable automatic highlight at page load
  document.removeEventListener('DOMContentLoaded', Prism.highlightAll)

  export default {
    name: 'process',
    props: {
      code: String
    },
    methods: {
      render () {
        logger.silly('Update Prism code highlight')
        if (this.code) {
          // We have to edit directly the dom to enable Prism plugins
          this.$refs.codeBlock.textContent = this.code
          Prism.highlightElement(this.$refs.codeBlock)
        } else {
          // No code yet
          this.$refs.codeBlock.textContent = 'loading ...'
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
  .token.hidden {
    display: none;
  }

  .token.in-out {
    color: lightgreen;
  }

  .token.punctuation.brace-selected, .token.punctuation.brace-hover {
    /*outline: unset;*/
    outline-color: rgba(255, 255, 0, 0.50);
    color: rgba(255, 255, 0, 0.90);
    background-color: rgba(255, 255, 0, 0.25);
    font-weight: bold;
  }

  /* To avoid different line high and bad line number */
  sup {
    vertical-align: top;
  }

  /* To avoid different line high and bad line number */
  sub {
    vertical-align: bottom;
  }
</style>

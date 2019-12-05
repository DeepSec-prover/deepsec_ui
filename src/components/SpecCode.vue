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
    },
    focusedPositions: {
      type: Array,
      default: null
    }
  },
  methods: {
    render () {
      logger.silly('Update Prism code highlight')
      if (this.code) {
        // We have to edit directly the dom to enable Prism plugins
        this.$refs.code.textContent = this.code
        Prism.highlightElement(this.$refs.code)
        // Trigger custom focus highlight
        if (this.focusedPositions) {
          this.focusCode()
        }
      } else {
        // No code yet
        this.$refs.code.textContent = 'loading ...'
      }
    },
    focusCode () {
      // Clean previous focus
      this.$el.querySelectorAll('.focused').forEach(e => {e.classList.remove('focused')})

      // Add focus to specific positions
      if (this.focusedPositions && this.focusedPositions.length > 0) {
        this.focusedPositions.forEach(p => {
          this.$el.querySelectorAll(`.position-${p}`).forEach(e => {
            e.classList.add('focused')
          })
        })
      }
    }
  },
  watch: {
    code () {
      this.render()
    },
    focusedPositions () {
      this.focusCode()
    }
  },
  mounted () {
    this.render()
  }
}
</script>

<style>
  .focused {
    border: rgba(255, 0, 0, 0.7);
    border-style: solid;
    border-radius: 6px;
  }

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

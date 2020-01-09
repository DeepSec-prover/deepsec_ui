<template>
  <span> {{ memoryStr }}</span>
</template>

<script>
export default {
  name: 'memory',
  props: {
    memory: {
      type: Number,
      default: null,
      required: true
    }
  },
  computed: {
    memoryStr: function () {
      let gb = 1000000000
      let mb = 1000000
      let kb = 1000
      if (this.memory >= gb) {
        return Math.floor(this.memory / gb) + 'GB'
      } else if (this.memory >= mb) {
        return Math.floor(this.memory / mb) + 'MB'
      } else if (this.memory >= kb) {
        return Math.floor(this.memory / kb) + 'KB'
      } else {
        return this.memory + 'B'
      }
    }
  }
}
</script>

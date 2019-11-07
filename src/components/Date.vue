<template>
  <span v-if="!date">-</span>
  <span v-else>{{ date.toLocaleDateString() }} {{ date.toLocaleTimeString() }}</span>
</template>

<script>
  export default {
    name: 'date',
    props: {
      date: Date,
      strict: {
        type: Boolean,
        default: false
      }
    }
  }
</script>

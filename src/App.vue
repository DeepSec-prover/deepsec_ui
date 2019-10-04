<template>
  <layout id="app">
    <router-view/>
  </layout>
</template>

<script>
  import Layout from './components/Layout'

  export default {
    name: 'app',
    components: {
      Layout
    }
  }
</script>

<style type="scss">
  @import "assets/styles/global.scss";
</style>

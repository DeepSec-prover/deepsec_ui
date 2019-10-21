<template>
  <div>
    <!-- TODO breadcrumb -->

    <h2><i :class="[icons[batch.status], batch.status]"></i> Batch {{ batch.title() }} {{ text.status[batch.status] }}</h2>

  </div>
</template>

<script>
  import icons from '../text-content/icons'
  import text from '../text-content/text'

  export default {
    name: 'batch',
    props: {
      batch: Object
    },
    data () {
      return {
        icons: icons,
        text: text
      }
    }
  }
</script>

<style scoped>

</style>

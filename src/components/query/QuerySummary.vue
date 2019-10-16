<template>
  <div>
    <dl class="in-line">
      <dt>Semantics</dt>
      <dd>
        <helper :helper-id="`semantics.${query.semantics}`"><span>{{ query.semantics }}</span></helper>
      </dd>
      <dt>Type</dt>
      <dd>{{ text.query.type[query.type] }}</dd>
    </dl>
  </div>
</template>

<script>
  import Helper from '../helpers/Helper'
  import text from '../../text-content/text'

  export default {
    name: 'query-summary',
    components: {
      Helper
    },
    props: {
      query: Object
    },
    data () {
      return {
        text: text
      }
    }
  }
</script>

<style scoped>

</style>

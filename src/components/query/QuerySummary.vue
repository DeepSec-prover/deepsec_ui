<template>
  <div>
    <el-row>
      <!-- General information -->
      <el-col>
        <dl class="in-line">
          <dt>Semantics</dt>
          <dd>
            <helper :helper-id="`semantics.${query.semantics}`" :text-content="true">{{ query.semantics }}</helper>
          </dd>
          <dt>Type</dt>
          <dd>
            <helper :helper-id="`query.type.${query.type}`" :text-content="true">{{ text.query.type[query.type] }}</helper>
          </dd>
        </dl>
      </el-col>
      <el-col>
        <dl class="in-line">
          <dt>Constructor function symbols</dt>
          <dd>TODO</dd>
          <dt>Destructor function symbols</dt>
          <dd>TODO</dd>
          <dt>Public names</dt>
          <dd>TODO</dd>
          <dt>Private names</dt>
          <dd>TODO</dd>
          <dt>Rewriting system</dt>
          <dd>TODO</dd>
        </dl>
      </el-col>
    </el-row>

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

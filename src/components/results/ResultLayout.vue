<template>
  <div>
    <result-breadcrumb :batch="breadcrumbBatch"
                       :run="breadcrumbRun"
                       :query="breadcrumbQuery"></result-breadcrumb>

    <h2>
      <i :class="[icons[resultObject.status], resultObject.status]"></i>
      {{ classTitle }} <em>{{ resultObject.title() }}</em> {{ text.status[resultObject.status] }}
    </h2>

    <div id="summary">
      <slot name="summary"></slot>
    </div>
    <div id="details">
      <slot name="details"></slot>
    </div>
  </div>
</template>

<script>
  import ResultBreadcrumb from './ResultBreadcrumb'
  import ResultModel from '../../models/ResultModel'
  import icons from '../../text-content/icons'
  import text from '../../text-content/text'
  import BatchModel from '../../models/BatchModel'
  import RunModel from '../../models/RunModel'
  import QueryModel from '../../models/QueryModel'

  export default {
    name: 'result-layout',
    components: {
      ResultBreadcrumb
    },
    props: {
      resultObject: {
        type: ResultModel
      }
    },
    data () {
      return {
        icons: icons,
        text: text
      }
    },
    computed: {
      breadcrumbBatch: function () {
        if (this.resultObject instanceof BatchModel) {
          return this.resultObject
        }

        return this.resultObject.batch
      },
      breadcrumbRun: function () {
        if (this.resultObject instanceof RunModel) {
          return this.resultObject
        }

        if (this.resultObject instanceof QueryModel) {
          return this.resultObject.run
        }

        // If batch, no specific run
        return null
      },
      breadcrumbQuery: function () {
        if (this.resultObject instanceof QueryModel) {
          return this.resultObject
        }

        // If batch or run, no specific run
        return null
      },
      classTitle: function () {
        if (this.resultObject instanceof BatchModel) {
          return 'Batch'
        }
        if (this.resultObject instanceof RunModel) {
          return 'Run'
        }
        if (this.resultObject instanceof QueryModel) {
          return 'Query'
        }
      }
    }
  }
</script>

<style scoped>
  h2 > em {
    font-style: normal;
    color: #909399;
  }

  #summary {
    margin-bottom: 30px;
  }
</style>

<template>
  <div>
    <result-breadcrumb :batch="breadcrumbBatch"
                       :run="breadcrumbRun"
                       :query="breadcrumbQuery"></result-breadcrumb>

    <h2>
      <result-status :status="resultObject.status"></result-status>
      {{ classTitle }} <em>{{ resultObject.title() }}</em> {{ text.status[resultObject.status] }}
      <slot name="post-title"></slot>
    </h2>

    <div id="actions" v-if="this.$slots.actions">
      <slot name="actions"></slot>
    </div>

    <div id="summary">
      <slot name="summary"></slot>
    </div>

    <div v-if="this.$slots.progression">
      <div id="progression">
        <h3><slot name="progression"></slot></h3>
        <el-progress :stroke-width="10"
                     :percentage="resultObject.progressionPercent()"
                     :color="progressionColor"></el-progress>
      </div>
      <el-divider></el-divider>
    </div>

    <div id="details">
      <slot name="details"></slot>
    </div>
  </div>
</template>

<script>
  import ResultBreadcrumb from './ResultBreadcrumb'
  import ResultStatus from './ResultStatus'
  import ResultModel from '../../models/ResultModel'
  import text from '../../text-content/text'
  import BatchModel from '../../models/BatchModel'
  import RunModel from '../../models/RunModel'
  import QueryModel from '../../models/QueryModel'

  export default {
    name: 'result-layout',
    components: {
      ResultBreadcrumb,
      ResultStatus
    },
    props: {
      resultObject: {
        type: ResultModel
      }
    },
    data () {
      return {
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
      },
      progressionColor: function () {
        switch (this.resultObject.status) {
          case 'completed':
            return '#67C23A'
          case 'in_progress':
            return '#409EFF'
          case 'internal_error':
            return '#F56C6C'
          case 'canceled':
            return '#E6A23C'
          default:
            return ''
        }
      }
    }
  }
</script>

<style scoped>
  h2 {
    height: 28px;
  }

  h2 > em {
    font-style: normal;
    color: #909399;
  }

  #summary {
    margin-bottom: 30px;
  }

  #actions {
    margin-bottom: 15px;
    margin-left: 20px;
  }

  #progression {
    margin: 20px
  }
</style>

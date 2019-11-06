<template>
  <div>
    <!-- Show error message if present -->
    <el-alert v-if="query.errorMsg" title="Error" type="error" :description="query.errorMsg" show-icon :closable="false"></el-alert>
    <el-row>
      <el-col :lg="9">
        <!-- General information -->
        <dl class="in-line">
          <dt>File</dt>
          <dd>{{ query.run.inputFileName() }}</dd> <!-- TODO open file link -->
          <dt>Semantics</dt>
          <dd>
            <helper :helper-id="`semantics.${query.semantics}`" text-content>{{ query.semantics }}</helper>
          </dd>
          <dt>Query type</dt>
          <dd>
            <helper :helper-id="`query.type.${query.type}`" text-content>{{ text.query.type[query.type] }}</helper>
          </dd>
          <template v-if="query.startTime">
            <dt>Start time</dt>
            <dd>{{ query.startTime.toLocaleDateString() }} {{ query.startTime.toLocaleTimeString() }}</dd>
            <dt>Running time</dt>
            <dd>
              <duration :start-time="query.startTime" :end-time="query.endTime"></duration>
            </dd>
          </template>
        </dl>
      </el-col>
      <el-col :lg="15">
        <dl class="in-line">
          <dt>Constructor symbols</dt>
          <dd>
            <!-- Public -->
            <span v-if="publicConstructors">
              <el-tag size="mini" effect="plain" class="tag" type="success">Public :</el-tag>
              <spec-code in-line :code="publicConstructors"></spec-code>
            </span>
            <!-- Private -->
            <span v-if="privateConstructors">
              <el-tag size="mini" effect="plain" class="tag">Private :</el-tag>
              <spec-code in-line :code="publicConstructors"></spec-code>
            </span>
            <!-- None -->
            <span v-if="!publicConstructors && !privateConstructors">
              <el-tag size="mini" effect="plain" class="tag" type="info">None</el-tag>
            </span>
          </dd>
          <dt>Destructor symbols</dt>
          <dd>
            <!-- Public -->
            <span v-if="publicDestructors">
              <el-tag size="mini" effect="plain" class="tag" type="success">Public :</el-tag>
              <spec-code in-line :code="publicDestructors"></spec-code>
            </span>
            <!-- Private -->
            <span v-if="privateDestructors">
              <el-tag size="mini" effect="plain" class="tag">Private :</el-tag>
              <spec-code in-line :code="publicDestructors"></spec-code>
            </span>
            <!-- None -->
            <span v-if="!publicDestructors && !privateDestructors">
              <el-tag size="mini" effect="plain" class="tag" type="info">None</el-tag>
            </span>
          </dd>
          <dt>Names</dt>
          <dd>
            <!-- Public -->
            <span v-if="publicNames">
              <el-tag size="mini" effect="plain" class="tag" type="success">Public :</el-tag>
              <spec-code in-line :code="publicNames"></spec-code>
            </span>
            <!-- Private -->
            <span v-if="privateNames">
              <el-tag size="mini" effect="plain" class="tag">Private :</el-tag>
              <spec-code in-line :code="publicNames"></spec-code>
            </span>
            <!-- None -->
            <span v-if="!publicNames && !privateNames">
              <el-tag size="mini" effect="plain" class="tag" type="info">None</el-tag>
            </span>
          </dd>
          <dt :class="{'label-top': rewritingSystem.length > 1}">Rewriting system</dt>
          <dd>
            <!-- Only one -->
            <spec-code :code="rewritingSystem[0]" in-line v-if="rewritingSystem.length === 1"></spec-code>
            <!-- Many -->
            <ul v-else-if="rewritingSystem.length > 1" class="rewriting-list">
              <li v-for="rs in rewritingSystem">
                <spec-code in-line :code="rs"></spec-code>
              </li>
            </ul>
            <!-- None -->
            <el-tag v-else size="mini" effect="plain" class="tag" type="info">None</el-tag>
          </dd>
        </dl>
      </el-col>
    </el-row>
    <el-row v-if="query.isCompleted()">
      <el-divider></el-divider>
      <p>{{ query.longResultDescription() }}</p>
      <spec-code in-line v-if="query.attackTrace" :code="formattedAttackTrace"></spec-code>
    </el-row>
  </div>
</template>

<script>
  import Helper from '../helpers/Helper'
  import SpecCode from '../SpecCode'
  import Duration from '../Duration'
  import text from '../../text-content/text'
  import { formatProcess, formatTrace } from '../../util/process-parser'

  export default {
    name: 'query-summary',
    components: {
      Helper,
      SpecCode,
      Duration
    },
    props: {
      query: Object
    },
    computed: {
      publicConstructors: function () {
        return this.query.atomicData.filter(a => {
          return a.type === 'Symbol'
            && a.category.type === 'Constructor'
            && a.representation === 'UserDefined'
            && a.is_public
        }).map(a => `${a.label}/${a.arity}`).join(',')
      },
      privateConstructors: function () {
        return this.query.atomicData.filter(a => {
          return a.type === 'Symbol'
            && a.category.type === 'Constructor'
            && a.representation === 'UserDefined'
            && !a.is_public
        }).map(a => `${a.label}/${a.arity}`).join(',')
      },
      publicDestructors: function () {
        return this.query.atomicData.filter(a => {
          return a.type === 'Symbol'
            && a.category.type === 'Destructor'
            && a.is_public
        }).map(a => `${a.label}/${a.arity}`).join(',')
      },
      privateDestructors: function () {
        return this.query.atomicData.filter(a => {
          return a.type === 'Symbol'
            && a.category.type === 'Destructor'
            && !a.is_public
        }).map(a => `${a.label}/${a.arity}`).join(',')
      },
      publicNames: function () {
        return this.query.atomicData.filter(a => {
          return a.type === 'Symbol'
            && a.representation === 'UserName'
            && a.is_public
        }).map(a => a.label).join(',')
      },
      privateNames: function () {
        return this.query.atomicData.filter(a => {
          return a.type === 'Symbol'
            && a.representation === 'UserName'
            && !a.is_public
        }).map(a => a.label).join(',')
      },
      rewritingSystem: function () {
        let destructors = this.query.atomicData.filter(a => {
          return a.type === 'Symbol'
            && a.category.type === 'Destructor'
        })

        let rewriteRulesStr = []

        destructors.forEach(d => {
          d.category.rewrite_rules.forEach(r => {
            let rhs = formatProcess(r.rhs, this.query.atomicData)
            let lhs = r.lhs.map(x => formatProcess(x, this.query.atomicData)).join(',')
            rewriteRulesStr.push(`${d.label}(${lhs}) -> ${rhs}`)
          })
        })

        return rewriteRulesStr
      },
      formattedAttackTrace: function () {
        return formatTrace(this.query.attackTrace.action_sequence, this.query.atomicData)
      },
    },
    data () {
      return {
        text: text
      }
    }
  }
</script>

<style scoped>
  .tag {
    margin-right: 5px;
  }

  .label-top {
    align-self: auto; /* Align top for multi line content */
  }

  ul.rewriting-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
</style>

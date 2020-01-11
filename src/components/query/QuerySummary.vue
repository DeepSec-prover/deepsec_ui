<template>
  <div>
    <!-- Show error message if present -->
    <el-alert v-if="query.errorMsg" title="Error" type="error" :description="query.errorMsg" show-icon :closable="false"></el-alert>
    <el-row>
      <el-col :lg="12">
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
          <template v-if="query.batch.debug">
            <dt>Debug</dt>
            <dd>
              <el-tag size="mini" type="danger"><i class="el-icon-view"></i> yes</el-tag>
            </dd>
          </template>
        </dl>
      </el-col>
      <el-col :lg="12" v-if="query.startTime">
        <dl class="in-line">
          <dt>Start time</dt>
          <dd>
            <date :date="query.startTime"></date>
          </dd>
          <template v-if="query.endTime">
            <dt>End time</dt>
            <dd>
              <date :date="query.endTime"></date>
            </dd>
          </template>
          <dt>Running time</dt>
          <dd>
            <duration :start-time="query.startTime" :end-time="query.endTime"></duration>
          </dd>
          <template v-if="query.memory !== 0">
            <dt>Memory</dt>
            <dd>
              <memory :memory="query.memory"></memory>
            </dd>
          </template>
        </dl>
      </el-col>
    </el-row>
    <el-row>
      <dl class="in-line">
        <dt :class="{'label-top': publicConstructors && privateConstructors}">Constructor symbols</dt>
        <dd>
          <!-- Public -->
          <div v-if="publicConstructors">
            <el-tag size="mini" effect="plain" class="tag" type="success">Public :</el-tag>
            <spec-code-inline :code="publicConstructors"></spec-code-inline>
          </div>
          <!-- Private -->
          <div v-if="privateConstructors">
            <el-tag size="mini" effect="plain" class="tag">Private :</el-tag>
            <spec-code-inline :code="privateConstructors"></spec-code-inline>
          </div>
          <!-- None -->
          <span v-if="!publicConstructors && !privateConstructors">
            <el-tag size="mini" effect="plain" class="tag" type="info">None</el-tag>
          </span>
        </dd>
        <dt :class="{'label-top': publicDestructors && privateDestructors}">Destructor symbols</dt>
        <dd>
          <!-- Public -->
          <div v-if="publicDestructors">
            <el-tag size="mini" effect="plain" class="tag" type="success">Public :</el-tag>
            <spec-code-inline :code="publicDestructors"></spec-code-inline>
          </div>
          <!-- Private -->
          <div v-if="privateDestructors">
            <el-tag size="mini" effect="plain" class="tag">Private :</el-tag>
            <spec-code-inline :code="privateDestructors"></spec-code-inline>
          </div>
          <!-- None -->
          <span v-if="!publicDestructors && !privateDestructors">
            <el-tag size="mini" effect="plain" class="tag" type="info">None</el-tag>
          </span>
        </dd>
        <dt :class="{'label-top': publicNames && privateNames}">Names</dt>
        <dd>
          <!-- Public -->
          <div v-if="publicNames">
            <el-tag size="mini" effect="plain" class="tag" type="success">Public :</el-tag>
            <spec-code-inline :code="publicNames"></spec-code-inline>
          </div>
          <!-- Private -->
          <div v-if="privateNames">
            <el-tag size="mini" effect="plain" class="tag">Private :</el-tag>
            <spec-code-inline :code="privateNames"></spec-code-inline>
          </div>
          <!-- None -->
          <span v-if="!publicNames && !privateNames">
            <el-tag size="mini" effect="plain" class="tag" type="info">None</el-tag>
          </span>
        </dd>
        <dt :class="{'label-top': rewritingSystem.length > 1}">Rewriting system</dt>
        <dd>
          <!-- Only one -->
          <spec-code-inline :code="rewritingSystem[0]" v-if="rewritingSystem.length === 1"></spec-code-inline>
          <!-- Many -->
          <ul v-else-if="rewritingSystem.length > 1" class="rewriting-list">
            <li v-for="rs in rewritingSystem">
              <spec-code-inline :code="rs"></spec-code-inline>
            </li>
          </ul>
          <!-- None -->
          <el-tag v-else size="mini" effect="plain" class="tag" type="info">None</el-tag>
        </dd>
      </dl>
    </el-row>
    <el-row v-if="query.run.warnings && query.run.warnings.length > 0">
      <el-collapse>
        <run-warnings :warnings="query.run.warnings" :inQuery="true"></run-warnings>
      </el-collapse>
    </el-row>
    <el-row v-if="query.isCompleted()">
      <el-divider v-if="!(query.run.warnings && query.run.warnings.length > 0)"></el-divider>
      <p>{{ query.longResultDescription() }}</p>
      <spec-code-inline v-if="query.attackTrace" :code="formattedAttackTrace"></spec-code-inline>
    </el-row>
  </div>
</template>

<script>
import RunWarnings from '../RunWarnings'
import Helper from '../helpers/Helper'
import Date from '../Date'
import Duration from '../Duration'
import Memory from '../Memory'
import text from '../../text-content/text'
import { formatCode, formatTrace } from '../../util/process-parser'
import AtomicRenamer from '../../util/AtomicRenamer'
import SpecCodeInline from '../code/SpecCodeInline'

const BREAK_POINT = '\u200B' // zero-width space

export default {
  name: 'query-summary',
  components: {
    SpecCodeInline,
    Helper,
    Date,
    Memory,
    Duration,
    RunWarnings
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
      }).map(a => `${a.label}/${a.arity}`).join(',' + BREAK_POINT)
    },
    privateConstructors: function () {
      return this.query.atomicData.filter(a => {
        return a.type === 'Symbol'
          && a.category.type === 'Constructor'
          && a.representation === 'UserDefined'
          && !a.is_public
      }).map(a => `${a.label}/${a.arity}`).join(',' + BREAK_POINT)
    },
    publicDestructors: function () {
      return this.query.atomicData.filter(a => {
        return a.type === 'Symbol'
          && a.category.type === 'Destructor'
          && a.is_public
      }).map(a => `${a.label}/${a.arity}`).join(',' + BREAK_POINT)
    },
    privateDestructors: function () {
      return this.query.atomicData.filter(a => {
        return a.type === 'Symbol'
          && a.category.type === 'Destructor'
          && !a.is_public
      }).map(a => `${a.label}/${a.arity}`).join(',' + BREAK_POINT)
    },
    publicNames: function () {
      return this.query.atomicData.filter(a => {
        return a.type === 'Symbol'
          && a.representation === 'UserName'
          && a.is_public
      }).map(a => a.label).join(',' + BREAK_POINT)
    },
    privateNames: function () {
      return this.query.atomicData.filter(a => {
        return a.type === 'Symbol'
          && a.representation === 'UserName'
          && !a.is_public
      }).map(a => a.label).join(',' + BREAK_POINT)
    },
    rewritingSystem: function () {
      let destructors = this.query.atomicData.filter(a => {
        return a.type === 'Symbol'
          && a.category.type === 'Destructor'
      })

      let rewriteRulesStr = []

      destructors.forEach(d => {
        d.category.rewrite_rules.forEach(r => {
          // Create a shared atomic renamer for every part of the rewriting system
          const atomic = new AtomicRenamer(this.query.atomicData)
          let lhs = r.lhs.map(x => formatCode(x, atomic)).join(',' + BREAK_POINT)
          let rhs = formatCode(r.rhs, atomic)
          rewriteRulesStr.push(`${d.label}(${lhs}) -> ${rhs}`)
        })
      })

      return rewriteRulesStr
    },
    formattedAttackTrace: function () {
      return formatTrace(this.query.attackTrace.action_sequence, this.query.atomicData)
    }
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
    margin-bottom: 5px;
  }

  .label-top + dd {
    margin: 5px 0;
  }

  ul.rewriting-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
</style>

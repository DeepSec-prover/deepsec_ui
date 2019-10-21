<template>
  <div>
    <!-- TODO breadcrumb -->

    <h2><i :class="[icons[batch.status], batch.status]"></i> Batch <em>{{ batch.title() }}</em> {{ text.status[batch.status] }}</h2>

    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-s-data"></i> Summary</span>
        <dl class="in-line">
          <dt>Nb run</dt>
          <dd>{{ batch.nbRun() }}</dd>
          <template v-if="batch.startTime">
            <dt>Start time</dt>
            <dd>{{ batch.startTime.toLocaleDateString() }} {{ batch.startTime.toLocaleTimeString() }}</dd>
            <dt>Running time</dt>
            <dd>
              <duration :start-time="batch.startTime" :end-time="batch.endTime"></duration>
            </dd>
          </template>
        </dl>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-set-up"></i> Run Options</span>
      </el-tab-pane>
      <el-tab-pane>
        <span slot="label"><i class="el-icon-monitor"></i> DeepSec version</span>
        <dl class="in-line">
          <dt>Version</dt>
          <dd>{{ batch.deepsecVersion }}</dd>
          <dt>Git Branch</dt>
          <dd>
            <a :href="branchUrl" target="_blank" @click.prevent="openExternalBrowser">
              {{ batch.gitBranch }}
            </a>
          </dd>
          <dt>Git Hash</dt>
          <dd>
            <a :href="hashUrl" target="_blank" @click.prevent="openExternalBrowser">
              {{ batch.gitHash }}
            </a>
          </dd>
        </dl>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
  import icons from '../text-content/icons'
  import text from '../text-content/text'
  import Duration from '../components/Duration'
  import settings from '../../settings'
  import path from 'path'

  const { remote } = require('electron');

  export default {
    name: 'batch',
    components: {
      Duration
    },
    props: {
      batch: Object
    },
    data () {
      return {
        icons: icons,
        text: text
      }
    },
    methods: {
      openExternalBrowser(e) {
        remote.shell.openExternal(e.target.href);
      },
    },
    computed: {
      branchUrl: function () {
        return path.join(settings.deepsecGitUrl, 'tree', this.batch.gitBranch)
      },
      hashUrl: function () {
        return path.join(settings.deepsecGitUrl, 'tree', this.batch.gitHash)
      }
    }
  }
</script>

<style scoped>
  dd > a {
    color: initial;
    text-decoration: initial;
  }

  dd > a:hover {
    text-decoration: underline;
  }
</style>

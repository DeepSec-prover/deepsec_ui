<template>
  <el-breadcrumb id="breadcrumb" separator="/">
    <!-- All results -->
    <!-- TODO go to current batch page in all-results -->
    <el-breadcrumb-item :to="{name: 'all-results'}">
      results
    </el-breadcrumb-item>

    <!-- Batch -->
    <el-breadcrumb-item v-if="isRoute('batch')">
      <span class="current-location">batch ({{ batch.title() }})</span>
    </el-breadcrumb-item>
    <el-breadcrumb-item v-else :to="{ name: 'batch', params: { path: batch.path } }">
      batch ({{ batch.title() }})
    </el-breadcrumb-item>

    <!-- Run -->
    <el-breadcrumb-item>
      <router-link v-if="query" :to="{name: 'run', params: { path: query.run.path } }">
        run ({{ run.title() }})
      </router-link>
      <template v-else-if="run">
        <span :class="{'current-location': isRoute('run')}">run ({{ run.title() }}) </span>
      </template>
      <template v-else>runs</template>
      <!-- Listing -->
      <el-dropdown trigger="click" @command="goToRun">
        <i class="el-icon-arrow-down dropdown-link"></i>
        <el-dropdown-menu slot="dropdown">
          <template v-if="otherRuns.length > 0">
            <el-dropdown-item v-for="run in otherRuns" :command="run.path">
              {{ run.title() }}
            </el-dropdown-item>
          </template>
          <template v-else>
            <el-dropdown-item disabled>no more</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </el-breadcrumb-item>

    <!-- Query -->
    <el-breadcrumb-item v-if="run">
      <template v-if="query">
        <span class="current-location">query {{query.title()}} </span></template>
      <template v-else>
        queries
      </template>
      <!-- Listing -->
      <el-dropdown trigger="click" @command="goToQuery">
        <i class="el-icon-arrow-down dropdown-link"></i>
        <el-dropdown-menu slot="dropdown">
          <template v-if="otherQueries.length > 0">
            <el-dropdown-item v-for="query in otherQueries" :command="query.path">
              query {{ query.index }}
            </el-dropdown-item>
          </template>
          <template v-else>
            <el-dropdown-item disabled>no more</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'result-breadcrumb',
  props: {
    batch: {
      type: Object
    },
    run: {
      type: Object,
      default: undefined
    },
    query: {
      type: Object,
      default: undefined
    }
  },
  methods: {
    isRoute (routeName) {
      return this.$route.name === routeName
    },
    goToQuery (path) {
      this.$router.push({ name: 'query', params: { path: path } })
    },
    goToRun (path) {
      this.$router.push({ name: 'run', params: { path: path } })
    }
  },
  computed: {
    /**
     * Get all batch's runs except the current one (if define).
     * Load data from files if necessary.
     *
     * @returns {Array} List if runs
     */
    otherRuns: function () {
      if (this.batch.runs === undefined) {
        // Load runs
        // Also reload the current one but it's not big deal
        this.batch.loadRelations()
      }

      if (this.run) {
        // Return all except the current one
        return this.batch.runs.filter(r => r.path !== this.run.path)
      } else {
        return this.batch.runs
      }
    },
    /**
     * Get all run's queries except the current one (if define).
     * Load data from files if necessary.
     *
     * @returns {Array} List if queries
     */
    otherQueries: function () {
      if (this.run.queries === undefined) {
        // Also reload the current one but it's not big deal
        this.run.loadQueries()
      }

      if (this.query) {
        // Return all except the current one
        return this.run.queries.filter(q => q.path !== this.query.path)
      } else {
        return this.run.queries
      }
    }
  }
}
</script>

<style scoped>
  #breadcrumb {
    margin-bottom: 20px;
  }

  .dropdown-link {
    cursor: pointer;
  }

  .current-location {
    color: #409EFF;
  }
</style>

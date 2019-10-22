<template>
  <el-breadcrumb id="breadcrumb" separator="/">
    <!-- Batch -->
    <el-breadcrumb-item v-if="isRoute('batch')">
      batch ({{ batch.title() }})
    </el-breadcrumb-item>
    <el-breadcrumb-item v-else :to="{ name: 'batch', params: { path: batch.path } }">
      batch ({{ batch.title() }})
    </el-breadcrumb-item>
    <!-- Run -->
    <el-breadcrumb-item>
      <router-link v-if="query" :to="{name: 'run', params: { path: query.run.path } }">
        run ({{ run.title() }})
      </router-link>
      <template v-else-if="run">run ({{ run.title() }}) </template>
      <template v-else>runs </template>
      <!-- Listing -->
      <el-dropdown trigger="click" @command="goToRun">
        <i class="el-icon-arrow-down dropdown-link"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="run in batch.runs" :command="run.path">
            {{ run.title() }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-breadcrumb-item>
    <!-- Query -->
    <el-breadcrumb-item v-if="run">
      <template v-if="query">query {{query.title()}} </template>
      <template v-else>
        queries
      </template>
      <!-- Listing -->
      <el-dropdown trigger="click" @command="goToQuery">
        <i class="el-icon-arrow-down dropdown-link"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(query, index) in run.queries" :command="query.path">
            Query {{ index + 1 }}
          </el-dropdown-item>
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
        default: null
      },
      query: {
        type: Object,
        default: null
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
    data () {
      return {}
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
</style>

<template>
  <el-container>
    <!-- Side menu -->
    <el-aside id="side-menu">
      <h1 class="logo">DeepSec UI</h1>
      <el-menu :default-active="this.$route.name">
        <el-menu-item index="home" @click="routePush('home')">
          <i class="el-icon-s-home"></i>
          <span>Home</span>
        </el-menu-item>
        <el-menu-item index="start-run" @click="routePush('start-run')">
          <i class="el-icon-video-play"></i>
          <span>Start Run</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!-- Main content -->
    <el-container>
      <el-main>
        <slot></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'layout',
    methods: {
      routePush (routeName) {
        if (this.$route.name !== routeName) {
          this.$router.push({ name: routeName })
        }
      }
    }
  }
</script>

<style scoped>
  #side-menu {
    width: 200px !important;
  }

  .logo {
    text-align: center;
    color: #409EFF;
  }
</style>

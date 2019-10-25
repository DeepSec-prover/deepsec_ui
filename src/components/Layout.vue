<template>
  <el-container>
    <!-- Side menu -->
    <el-aside id="side-menu" width="200px">
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
        <el-menu-item index="all-results" @click="routePush('all-results')">
          <i class="el-icon-finished"></i>
          <span>Results</span>
        </el-menu-item>
        <el-menu-item index="settings" @click="routePush('settings')" class="side-bottom">
          <i class="el-icon-s-tools"></i>
          <span>Settings</span>
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
  import { ipcRenderer } from 'electron'

  export default {
    name: 'layout',
    methods: {
      routePush (routeName) {
        if (this.$route.name !== routeName) {
          this.$router.push({ name: routeName })
        }
      }
    },
    mounted () {
      // When received data then show notification
      ipcRenderer.on('notification:show', (event, title, content, type, topic, link) => {
        this.$notification(title, content, type, topic, link, this.$router)
      })
    }
  }
</script>

<style scoped>
  .el-menu-item {
    height: 45px !important;
    line-height: 45px !important;
  }

  .logo {
    text-align: center;
    color: #409EFF;
  }
</style>

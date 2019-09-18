<template>
  <div id="app">
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li>
        <router-link to="start-run">Start Run</router-link>
      </li>
    </ul>
    <img alt="DeepSec logo" src="./assets/logo/logo.png">
    <h1>DeepSec UI</h1>
    <router-view/>
  </div>
</template>

<style scoped>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  img {
    height: 100px;
  }
</style>

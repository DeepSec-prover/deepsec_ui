import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import StartRun from './views/StartRun'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/start-run',
      name: 'start-run',
      component: StartRun
    }
  ]
})

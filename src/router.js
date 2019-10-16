import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import StartRun from './views/StartRun'
import AllResults from './views/AllResults'
import Settings from './views/Settings'
import Query from './views/Query'
import QueryModel from './models/QueryModel'

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
    },
    {
      path: '/all-results',
      name: 'all-results',
      component: AllResults
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/query/:path',
      name: 'query',
      component: Query,
      props: (route) => ({ query: new QueryModel(route.params.path) })
    }
  ]
})

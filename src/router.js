import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import StartRun from './views/StartRun'
import AllResults from './views/AllResults'
import Settings from './views/Settings'
import Query from './views/Query'
import QueryModel from './models/QueryModel'
import RunModel from './models/RunModel'
import BatchModel from './models/BatchModel'
import Run from './views/Run'
import Batch from './views/Batch'

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
      props: (route) => ({ query: new QueryModel(route.params.path, true) })
    },
    {
      path: '/run/:path',
      name: 'run',
      component: Run,
      props: (route) => ({ run: new RunModel(route.params.path, true) })
    },
    {
      path: '/batch/:path',
      name: 'batch',
      component: Batch,
      props: (route) => ({ batch: new BatchModel(route.params.path, true) })
    }
  ]
})

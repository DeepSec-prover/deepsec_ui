import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import StartRun from './views/StartRun'
import AllResults from './views/AllResults'
import Settings from './views/Settings'
import Query from './views/Query'
import Run from './views/Run'
import Batch from './views/Batch'

Vue.use(Router)

export default new Router(
  {
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
        alias: '/index.html' // Because the first call in bundled application go here
      },
      {
        path: '/start-run/:config?/:files*',
        name: 'start-run',
        component: StartRun,
        props: true
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
        props: true
      },
      {
        path: '/run/:path',
        name: 'run',
        component: Run,
        props: true
      },
      {
        path: '/batch/:path',
        name: 'batch',
        component: Batch,
        props: true
      }
    ]
  })

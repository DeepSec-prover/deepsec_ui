import Vue from 'vue'
import App from './App.vue'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import Element from 'element-ui' // TODO import only used components

Vue.config.productionTip = false

Vue.use(Element)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

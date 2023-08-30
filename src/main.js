import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import vuetify from './plugins/vuetify'
import vueCookie from 'vue-cookie'
import sanitizeHtml from '@/plugins/sanitizeHtml.js'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VueMatomo from 'vue-matomo'
import store from '@/store/store.js'

Vue.use(vueCookie)

Vue.use(sanitizeHtml)

if (process.env.VUE_APP_MATOMO_HOST && process.env.VUE_APP_MATOMO_SITE_ID) {
  Vue.use(VueMatomo, {
    host: process.env.VUE_APP_MATOMO_HOST,
    siteId: process.env.VUE_APP_MATOMO_SITE_ID,
    router,
    disableCookies: true
  })
}

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import AuthService from './auth/AuthService'
import axios from 'axios'

Vue.config.productionTip = false
axios.defaults.baseURL = process.env.API_BASE_URL
const auth = new AuthService()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})

axios.interceptors.response.use((response) => {
  return response
}, function (error) {
  // Do something with response error
  if (error.response.status === 401) {
    console.log('unauthorized, logging out ...')
    auth.logout()
    router.replace('/')
  }
  return Promise.reject(error)
})

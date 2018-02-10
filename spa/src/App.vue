<template>
  <div>
    <div class="container">
      <router-view 
        :auth="auth" 
        :authenticated="authenticated">
      </router-view>
    </div>
  </div> 
</template>

<script>
import AuthService from './auth/AuthService'
import Vue from 'vue'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/fi'
Vue.use(Element, { locale })

const auth = new AuthService()

const { login, logout, authenticated, authNotifier } = auth

export default {
  name: 'app',
  data () {
    authNotifier.on('authChange', authState => {
      this.authenticated = authState.authenticated
    })
    return {
      auth,
      authenticated
    }
  },
  methods: {
    login,
    logout
  }
}
</script>
<style>
body {
  background: #f8fbf4;
}
.el-tabs__nav-scroll {
  background: #8bc34a;
  color: #fff;
}
.el-tabs__item {
  color: #fff;
}
.el-tabs__item:hover {
  color: #466522;
  background: #e8f3db;
}
.el-tabs__item.is-active {
  color: #466522;
  background: #e8f3db;
}
.el-tabs__active-bar {
  background: transparent;
}
</style>



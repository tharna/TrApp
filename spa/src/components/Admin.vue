<template>
  <div v-if="admin">
           <el-tabs v-model="activeName">
          <el-tab-pane label="Viikkotehtävät" name="first">
              <Quests></Quests>
          </el-tab-pane>
          <el-tab-pane label="Kirjaudu ulos" name="logout">

          <el-button
            v-if="authenticated"
            @click="auth.logout()"
            type="primary" 
            round>
            Kirjaudu ulos
          </el-button>
          <router-link to="/home">Poistu ylläpidosta</router-link>
 
          </el-tab-pane>
        </el-tabs>
  </div>
</template>

<script>
import Quests from './QuestAdmin.vue'
import router from '../router'
export default {
  name: 'home',
  props: ['auth', 'authenticated'],
  data () {
    return {
      activeName: 'first',
      admin: false
    }
  },
  components: {
    Quests
  },
  created () {
    var user = JSON.parse(localStorage.getItem('user_details'))
    console.log(user)
    this.admin = this.authenticated && (user['https://app.aikojentanssi.fi/group'] === 99)
    if (!this.admin) {
      router.replace('/home')
    }
  }
}
</script>

<style>
a {
    cursor: pointer;
  }
</style>


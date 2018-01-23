<template>
  <div v-if="authenticated">
           <el-tabs v-model="activeName">
          <el-tab-pane label="Edistyminen" name="first">
              <activity></activity>
          </el-tab-pane>
          <el-tab-pane label="Treenit" name="second">
            <exercises></exercises>
          </el-tab-pane>
          <el-tab-pane label="Saavutukset" name="third">
            <achievements></achievements>
          </el-tab-pane>
          <el-tab-pane label="Kirjaudu ulos" name="logout">

          <el-button
            v-if="authenticated"
            @click="auth.logout()"
            type="primary" 
            round>
            Kirjaudu ulos
          </el-button>
          <router-link to="/admin" v-if="admin">Ylläpitoon</router-link>
          </el-tab-pane>
        </el-tabs>
  </div>
    <div v-else-if="!authenticated" style="text-align:center; padding-top: 50px;">
          <el-button
            @click="auth.login()"
            type="primary" 
            round>
            Kirjaudu sisään
          </el-button>
    </div>
</template>

<script>
import Activity from './Activity.vue'
import Exercises from './Exercises.vue'
import Achievements from './Achievements.vue'
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
    Activity,
    Exercises,
    Achievements
  },
  created () {
    var user = JSON.parse(localStorage.getItem('user_details'))
    console.log(user)
    this.admin = this.authenticated && (user['https://app.aikojentanssi.fi/group'] === 99)
  }

}
</script>

<style>
a {
    cursor: pointer;
  }
</style>


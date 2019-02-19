<template>
  <div v-if="admin">
           <el-tabs v-model="activeName">
          <el-tab-pane label="Viikkotehtävät" name="first">
              <Quests></Quests>
          </el-tab-pane>
          <el-tab-pane label="Urotyöt" name="second">
              <Achievements></Achievements>
          </el-tab-pane>
          <el-tab-pane label="Pelaajat" name="third">
              <Users></Users>
          </el-tab-pane>
          <el-tab-pane label="Tili" name="logout">

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
import Achievements from './AchievementAdmin.vue'
import Users from './UserAdmin.vue'
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
    Quests,
    Achievements,
    Users
  },
  created () {
    var user = JSON.parse(localStorage.getItem('user_details'))
    this.admin = this.authenticated && (user['https://app.traininglarp.fi/is_admin'] === 1)
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


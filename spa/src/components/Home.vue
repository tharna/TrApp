<template>
  <div v-if="authenticated">
           <el-tabs v-model="activeName">
          <el-tab-pane label="Aktiivisuus" name="first">
              <activity></activity>
          </el-tab-pane>
          <el-tab-pane label="Treenit" name="second">
            <exercises></exercises>
          </el-tab-pane>
          <el-tab-pane label="Tehtävät" name="third">
            <quests></quests>
          </el-tab-pane>
          <el-tab-pane label="Urotyöt" name="fourth">
            <achievements></achievements>
          </el-tab-pane>
          <el-tab-pane label="Tili" name="logout">

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
      <img src="/liikuntalarp_logo2.png"></img>
      <h3>Aikojen Tanssi - TreeniApp</h3>
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
import Quests from './Quests.vue'

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
    Achievements,
    Quests
  },
  created () {
    var user = JSON.parse(localStorage.getItem('user_details'))
    this.admin = this.authenticated && (user['https://app.aikojentanssi.fi/group'] === 99)
  }

}
</script>

<style>
a {
    cursor: pointer;
  }
</style>


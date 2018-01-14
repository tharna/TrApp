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
          </el-tab-pane>
        </el-tabs>
  </div>
    <h4 v-else-if="!authenticated">
          <el-button
            @click="auth.login()"
            type="primary" 
            round>
            Kirjaudu sisään
          </el-button>
    </h4>
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
      activeName: 'first'
    }
  },
  components: {
    Activity,
    Exercises,
    Achievements
  }
}
</script>

<style>
a {
    cursor: pointer;
  }
</style>


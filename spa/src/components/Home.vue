<template>
  <div v-if="authenticated">
    <el-tabs v-model="activeName">
      <el-tab-pane label="Aktiivisuus" name="first">
      </el-tab-pane>
      <el-tab-pane label="Treenit" name="second">
      </el-tab-pane>
      <el-tab-pane label="Tehtävät" name="third">
      </el-tab-pane>
      <!--el-tab-pane label="Urotyöt" name="fourth">
        <achievements :activeName="activeName"></achievements>
        </el-tab-pane-->
      <el-tab-pane label="Tili" name="logout">
      </el-tab-pane>

    </el-tabs>

    <swiper :options="swiperOption" ref="tabSwiper">
      <swiper-slide label="Aktiivisuus" name="first">
        <activity @update="updatePosted"></activity>
      </swiper-slide>
      <swiper-slide label="Treenit" name="second">
        <exercises :activeName="activeName" :updated="updated" @update="updateLoaded"></exercises>
      </swiper-slide>
      <swiper-slide label="Tehtävät" name="third">
        <quests :activeName="activeName"></quests>
      </swiper-slide>
      <!--el-tab-pane label="Urotyöt" name="fourth">
      <achievements :activeName="activeName"></achievements>
      </el-tab-pane-->
      <swiper-slide label="Tili" name="logout">

        <div class="account">
        <el-button
                                 v-if="authenticated"
                                 @click="auth.logout()"
                                 type="primary" 
                                 round>
          Kirjaudu ulos
        </el-button>
        <router-link to="/admin" v-if="admin">Ylläpitoon</router-link>
        </div>
      </swiper-slide>
    </swiper>
  </div>
    <div v-else-if="!authenticated" style="text-align:center; padding-top: 50px;">
      <img src="/liikuntalarp_logo2.png"></img>
      <h3>Traininglarp - TreeniApp</h3>
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
    const self = this
    return {
      activeName: 'first',
      admin: false,
      updated: false,
      tabs: [
        'first',
        'second',
        'third',
        'logout'
      ],
      swiperOption: {
        on: {
          slideChange () {
            self.activeName = self.tabs[this.activeIndex]
          }
        }
      }
    }
  },
  components: {
    Activity,
    Exercises,
    Achievements,
    Quests
  },
  methods: {
    updateLoaded: function () {
      this.updated = false
    },
    updatePosted: function () {
      this.updated = true
    }
  },
  created () {
    var user = JSON.parse(localStorage.getItem('user_details'))
    this.admin = this.authenticated && (user['https://app.traininglarp.fi/is_admin'])
  },
  computed: {
    swiper () {
      return this.$refs.tabSwiper.swiper
    }
  },
  watch: {
    activeName () {
      this.swiper.slideTo(this.tabs.findIndex(tab => { return tab === this.activeName }))
    }
  }
}
</script>

<style>
a {
  cursor: pointer;
}
.el-tabs__header {
  position: fixed;
  top: 0px;
  width: 100%;
  z-index: 2;
}
.el-tabs__nav-wrap.is-scrollable {
  padding: 0 50px;
}
.el-tabs__nav-next, .el-tabs__nav-prev {
  padding: 0 20px;
}
#tab-first {
  padding-left: 20px;
}
#tab-logout {
  padding-right: 20px;
}
.el-tab-pane {
  margin-top: 50px !important;
}
.swiper-slide > div {
  padding: 0 20px;
}
html,
body,
body > div,
.container,
.container > div,
.swiper-container {
/*  min-height: 100%;*/
}
.el-tabs__content {
  padding: 0 20px;
}
</style>


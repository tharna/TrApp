<template>
  <div>
    <el-row v-for="(achievement, index) in achievements">
      <el-col :span="4">
        <div style="text-align: center;">
          <el-progress type="circle" :percentage="achievement.progress" :status="achievement.status" :width="75"></el-progress>
        </div>
      </el-col>
      <el-col :lg="16" :md="16" :xs="20" :sm="14" :span="20">
        <div><h4 style="display: inline-block;">{{ achievement.name }}</h4>

              <el-rate
                 style="display: inline-block; float: right;"
                 disabled
                 v-bind:value="achievement.level"
                 >
              </el-rate>
          <br>
          {{ achievement.achievementDesc }}</div>
      </el-col>
      <el-col :lg="4" :md="4" :xs="24" :sm="6"  style="text-align: center;padding-bottom: 10px;">
        <el-button round @click="showAchievementActivity(achievement.achievementID)">Näytä tiedot</el-button>
        <el-button v-if="achievement.isActive" type="primary" round @click="addAchievementActivity(achievement.achievementID)">Lisää suoritus</el-button>
      </el-col>
      <hr>
    </el-row>

    <el-dialog
        title="Lisää suoritus"
        :visible.sync="addAchievementVisible"
        width="80%">
          {{ currentAchievement.achievementDesc }}<br>
          {{ currentAchievement.currentLevelDesc }}
          <span v-if="currentAchievement.achievementType==3">
            <br>Pisin putki: {{ currentAchievement.bestStreak }}<br>
          Tämänhetkinen putki: {{ currentAchievement.activity }}
          </span>
        <span v-if="currentAchievement.achievementType==1 || currentAchievement.achievementType==3">
          <br>Tehtävä suoritettu <span v-if="currentAchievement.achievementType==3">tänään</span>:<br>
          <el-button @click.native="addAchievementActivity = false" round>Ei</el-button>
          <el-button type="primary" :loading="loading" round @click.prevent="postAchievement(currentAchievement.achievementID)">Kyllä</el-button>
        </span>
        <span v-if="currentAchievement.achievementType==2">
          <br>Tämänhetkinen edistyminen: {{ currentAchievement.activity }} {{ currentAchievement.achievementMeasure }}<br>
        <el-input-number v-model="achievementActivity"></el-input-number> {{ currentAchievement.achievementMeasure }}
          <el-tooltip content="Määrä lisätään aiempiin suorituksiisi.">
                      <i class="el-icon-question"></i>
                              </el-tooltip>
                              <br><span slot="footer" class="dialog-footer">
            <el-button @click.native="addAchievementVisible = false" round>Peruuta</el-button>
            <el-button type="primary" :loading="loading" round @click.prevent="postAchievement(currentAchievement.achievementID)">Tallenna</el-button>
          </span>
        </span>
    </el-dialog>
    <el-dialog
        :title="currentAchievement.name"
        :visible.sync="showAchievementVisible"
        width="80%">
      <p>{{ currentAchievement.achievementDesc }}</p>
      <el-row>
        <el-col :span=24>
          <el-rate style="display: inline-block;" disabled value="1"></el-rate> {{ currentAchievement.lvl1Desc }}
        </el-col>
        <el-col :span=24>
          <el-rate style="display: inline-block;" disabled value="2"></el-rate> {{ currentAchievement.lvl2Desc }}
        </el-col>
        <el-col :span=24>
          <el-rate style="display: inline-block;" disabled value="3"></el-rate> {{ currentAchievement.lvl3Desc }}
        </el-col>
        <el-col :span=24>
          <el-rate style="display: inline-block;" disabled value="4"></el-rate> {{ currentAchievement.lvl4Desc }}
        </el-col>
        <el-col :span=24>
          <el-rate style="display: inline-block;" disabled value="5"></el-rate> {{ currentAchievement.lvl5Desc }}
        </el-col>
      </el-row>
          <span slot="footer" class="dialog-footer">
      <el-button @click.native="showAchievementVisible = false" round>OK</el-button>
          </span>

    </el-dialog>


  </div>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
Vue.use(axios)
export default {
  props: ['activeName'],
  data () {
    return {
      achievements: [
      ],
      loading: false,
      loaded: false,
      addAchievementVisible: false,
      showAchievementVisible: false,
      currentAchievement: {},
      achievementActivity: 1
    }
  },
  methods: {
    getAchievements: function () {
      axios.get('/data/achievement')
        .then(response => { this.achievements = response.data.achievements })
    },
    postAchievement: function (achievementID) {
      this.loading = true
      axios.post('/data/achievement', {
        achievementID: this.currentAchievement.achievementID,
        achievementActivity: this.achievementActivity,
        achievementType: this.currentAchievement.achievementType
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.loading = false
        this.$notify({
          title: 'Success',
          message: 'Lisätty onnistuneesti',
          type: 'success'
        })
        this.addAchievementVisible = false
        this.getAchievements()
      }).catch(err => {
        console.log(err)
        this.loading = false
        this.$notify({
          title: 'Virhe',
          message: 'Lisäys ei onnistunut',
          type: 'error'
        })
      })
    },
    addAchievementActivity: function (achievementID) {
      this.currentAchievement = this.achievements.find(achievement => { return achievement.achievementID === achievementID })
      this.addAchievementVisible = true
    },
    showAchievementActivity: function (achievementID) {
      this.currentAchievement = this.achievements.find(achievement => { return achievement.achievementID === achievementID })
      this.showAchievementVisible = true
    }
  },
  watch: {
    activeName: function () {
      if (this.activeName === 'fourth' && this.loaded === false) {
        this.getAchievements()
      }
    }
  }
}
</script>

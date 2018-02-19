<template>
  <div>
        <div style="text-align: center;">
          <el-button type="primary" @click="addAchievementVisible = true" round>Lisää urotyö</el-button>
          </div>
      <hr>
      <el-row>
      <el-col :span="24">
        <div class="columns medium-3" v-for="achievement in achievements">
          <div class="card">
            <div class="card-divider">
              {{ achievement.name }}
            </div>
            <div class="card-section">
              <p>{{ achievement.achievementActive | date }}</p>
              <el-button type="primary" round @click="editAchievement(achievement.achievementID)">Muokkaa</el-button> 
              <el-button type="primary" round @click="showAchievement(achievement.achievementID)">Suoritukset</el-button> 
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row>
    </el-row>
    <el-dialog
        title="Lisää urotyö"
        :visible.sync="addAchievementVisible"
        width="80%">
        Tehtävän nimi
        <el-input v-model="achievementName" placeholder="Tehtävän nimi"></el-input>
        Tehtävän kuvaus
        <el-input v-model="achievementDesc" placeholder="Kuvaus" type="textarea"></el-input>
        <el-row>
          <el-col :span=6>
            <el-radio v-model="achievementType" label="1">Suoritus</el-radio>
            <el-radio v-model="achievementType" label="2">Määrä</el-radio>
            <el-radio v-model="achievementType" label="3">Putki</el-radio>
          </el-col>
          <el-col v-show="achievementType == 2" :span=6>
            <el-input v-model="achievementMeasure" placeholder="Yksikkö"></el-input>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span=18>
        Tasovaatimukset:
          </el-col>
          <el-col v-show="achievementType == 2 || achievementType == 3" :span=6>
            Määrä:
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="achievementLVL1" placeholder="Taso 1"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="achievementType == 2 || achievementType == 3" v-model="achievementLVL1amount" placeholder="Taso 1"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="achievementLVL2" placeholder="Taso 2"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="achievementType == 2 || achievementType == 3" v-model="achievementLVL2amount" placeholder="Taso 2"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="achievementLVL3" placeholder="Taso 3"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="achievementType == 2 || achievementType == 3" v-model="achievementLVL3amount" placeholder="Taso 3"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="achievementLVL4" placeholder="Taso 4"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="achievementType == 2 || achievementType == 3" v-model="achievementLVL4amount" placeholder="Taso 4"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="achievementLVL5" placeholder="Taso 5"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="achievementType == 2 || achievementType == 3" v-model="achievementLVL5amount" placeholder="Taso 5"></el-input>
          </el-col>
        </el-row>

        <el-row>
        <el-col :span=6>
        Tehtävän aloituspäivä<br>
        <el-date-picker
                  v-model="achievementActive"
                  format="d.M.yyyy"
                  :picker-options="datePickerOpts"
                  placeholder="Aloituspäivä">
        </el-date-picker>
         </el-col>
         <el-col :span=6>
        Tehtävän päättymispäivä<br>
        <el-date-picker
                  v-model="achievementActiveEnd"
                  format="d.M.yyyy"
                  :picker-options="datePickerOpts"
                  placeholder="Päättymispäivä">
        </el-date-picker>
         </el-col>

        <el-col :span=6>
        Tehtävän julkaisupäivä<br>
        <el-date-picker
                  v-model="achievementPublish"
                  type="date"
                  :picker-options="datePickerOpts"
                  placeholder="Tehtävän julkaisu">
        </el-date-picker>
         </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
         </el-col>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button @click.native="addAchievementVisible = false" round>Peruuta</el-button>
          <el-button type="primary"  :loading="loadingSend" round @click.prevent="postAddAchievement">Lähetä</el-button>
        </span>
    </el-dialog>

    <el-dialog
        title="Muokkaa urotyötä"
        :visible.sync="editAchievementVisible"
        width="80%">
        Tehtävän nimi
        <el-input v-model="EachievementName" placeholder="Tehtävän nimi"></el-input>
        Tehtävän kuvaus
        <el-input v-model="EachievementDesc" placeholder="Kuvaus" type="textarea"></el-input>
        <el-row>
          <el-col :span=6>
            <el-radio v-model="EachievementType" label="1">Suoritus</el-radio>
            <el-radio v-model="EachievementType" label="2">Määrä</el-radio>
            <el-radio v-model="EachievementType" label="3">Putki</el-radio>
          </el-col>
          <el-col v-show="EachievementType == 2" :span=6>
            <el-input v-model="EachievementMeasure" placeholder="Yksikkö"></el-input>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span=18>
        Tasovaatimukset:
          </el-col>
          <el-col v-show="EachievementType == 2 || EachievementType == 3" :span=6>
            Määrä:
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="EachievementLVL1" placeholder="Taso 1"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="EachievementType == 2 || EachievementType == 3" v-model="EachievementLVL1amount" placeholder="Taso 1"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="EachievementLVL2" placeholder="Taso 2"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="EachievementType == 2 || EachievementType == 3" v-model="EachievementLVL2amount" placeholder="Taso 2"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="EachievementLVL3" placeholder="Taso 3"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="EachievementType == 2 || EachievementType == 3" v-model="EachievementLVL3amount" placeholder="Taso 3"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="EachievementLVL4" placeholder="Taso 4"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="EachievementType == 2 || EachievementType == 3" v-model="EachievementLVL4amount" placeholder="Taso 4"></el-input>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span=18>
            <el-input v-model="EachievementLVL5" placeholder="Taso 5"></el-input>
          </el-col>
          <el-col :span=6>
            <el-input v-show="EachievementType == 2 || EachievementType == 3" v-model="EachievementLVL5amount" placeholder="Taso 5"></el-input>
          </el-col>
        </el-row>

       <el-row>
          <el-col :span=6>
            Tehtävän aloituspäivä<br>
            <el-date-picker
                                              v-model="EachievementActive"
                                              format="d.M.yyyy"
                                              :picker-options="datePickerOpts"
                                              placeholder="Aloituspäivä">
            </el-date-picker>
          </el-col>
          <el-col :span=6>
            Tehtävän päättymispäivä<br>
            <el-date-picker
                                              v-model="EachievementActiveEnd"
                                              format="d.M.yyyy"
                                              :picker-options="datePickerOpts"
                                              placeholder="Päättymispäivä">
            </el-date-picker>
          </el-col>
 
          <el-col :span=6>
            Tehtävän julkaisupäivä<br>
            <el-date-picker
                                              v-model="EachievementPublish"
                                              type="date"
                                              format="d.M.yyyy"
                                              :picker-options="datePickerOpts"
                                              placeholder="Tehtävän julkaisu">
            </el-date-picker>
          </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
            </el-col>
          </el-row>
          <span slot="footer" class="dialog-footer">
          <el-button @click.native="editAchievementVisible = false" round>Peruuta</el-button>
          <el-button type="danger" :loading="loadingDel" @click.native="postDelAchievement" round>Poista</el-button>
          <el-button type="primary" :loading="loadingSend" round @click.prevent="postEditAchievement">Tallenna</el-button>
        </span>
    </el-dialog>



  </div>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
Vue.use(axios)
export default {
  data () {
    return {
      achievements: [
      ],
      loadingSend: false,
      loadingDel: false,
      addAchievementVisible: false,
      editAchievementVisible: false,
      achievementFilter: 'Kaikki',
      achievementName: '',
      achievementType: '',
      achievementDesc: '',
      achievementMeasure: '',
      achievementActive: '',
      achievementActiveEnd: '',
      achievementPublish: '',
      achievementLVL1: '',
      achievementLVL2: '',
      achievementLVL3: '',
      achievementLVL4: '',
      achievementLVL5: '',
      achievementLVL1amount: '',
      achievementLVL2amount: '',
      achievementLVL3amount: '',
      achievementLVL4amount: '',
      achievementLVL5amount: '',
      datePickerOpts: {
        firstDayOfWeek: 1
      },
      EachievementName: ' ',
      EachievementType: ' ',
      EachievementDesc: ' ',
      EachievementActive: ' ',
      EachievementMeasure: '',
      EachievementActiveEnd: ' ',
      EachievementPublish: ' ',
      EachievementLVL1: '',
      EachievementLVL2: '',
      EachievementLVL3: '',
      EachievementLVL4: '',
      EachievementLVL5: '',
      EachievementLVL1amount: '',
      EachievementLVL2amount: '',
      EachievementLVL3amount: '',
      EachievementLVL4amount: '',
      EachievementLVL5amount: '',
      EachievementID: ''
    }
  },
  methods: {
    getAchievements: function () {
      axios.get('/admin/achievement')
        .then(response => { this.achievements = response.data.achievements })
    },
    postAddAchievement: function () {
      this.loadingSend = true
      axios.post('/admin/achievement/add', {
        achievementName: this.achievementName,
        achievementType: this.achievementType,
        achievementDesc: this.achievementDesc,
        achievementMeasure: this.achievementMeasure,
        achievementLVL1: this.achievementLVL1,
        achievementLVL2: this.achievementLVL2,
        achievementLVL3: this.achievementLVL3,
        achievementLVL4: this.achievementLVL4,
        achievementLVL5: this.achievementLVL5,
        achievementLVL1amount: this.achievementLVL1amount,
        achievementLVL2amount: this.achievementLVL2amount,
        achievementLVL3amount: this.achievementLVL3amount,
        achievementLVL4amount: this.achievementLVL4amount,
        achievementLVL5amount: this.achievementLVL5amount,
        achievementActive: this.achievementActive,
        achievementActiveEnd: this.achievementActiveEnd,
        achievementPublish: this.achievementPublish
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.$notify({
          title: 'Success',
          message: 'Urotyö lisätty',
          type: 'success'
        })
        this.addAchievementVisible = false
        this.loadingSend = false
        this.getAchievements()
      }).catch(err => {
        console.log(err)
        this.loadingSend = false
        this.$notify({
          title: 'Virhe',
          message: 'Tallennus ei onnistunut',
          type: 'error'
        })
      })
    },
    postEditAchievement: function () {
      this.loadingSend = true
      axios.post('/admin/achievement/update', {
        achievementID: this.EachievementID,
        achievementName: this.EachievementName,
        achievementType: this.EachievementType,
        achievementDesc: this.EachievementDesc,
        achievementMeasure: this.EachievementMeasure,
        achievementLVL1: this.EachievementLVL1,
        achievementLVL2: this.EachievementLVL2,
        achievementLVL3: this.EachievementLVL3,
        achievementLVL4: this.EachievementLVL4,
        achievementLVL5: this.EachievementLVL5,
        achievementLVL1amount: this.EachievementLVL1amount,
        achievementLVL2amount: this.EachievementLVL2amount,
        achievementLVL3amount: this.EachievementLVL3amount,
        achievementLVL4amount: this.EachievementLVL4amount,
        achievementLVL5amount: this.EachievementLVL5amount,
        achievementActive: this.EachievementActive,
        achievementActiveEnd: this.EachievementActiveEnd,
        achievementPublish: this.EachievementPublish
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.$notify({
          title: 'Success',
          message: 'Urotyö tallennettu',
          type: 'success'
        })
        this.editAchievementVisible = false
        this.loadingSend = false
        this.getAchievements()
      }).catch(err => {
        console.log(err)
        this.loadingSend = false
        this.$notify({
          title: 'Virhe',
          message: 'Tallennus ei onnistunut',
          type: 'error'
        })
      })
    },
    editAchievement: function (achievementID) {
      var achievement = this.achievements.find(achievement => { return achievement.achievementID === achievementID })
      this.EachievementName = achievement.name
      this.EachievementType = achievement.type
      this.EachievementDesc = achievement.achievementDesc
      this.EachievementMeasure = achievement.achievementMeasure
      this.EachievementLVL1 = achievement.achievementLVL1
      this.EachievementLVL2 = achievement.achievementLVL2
      this.EachievementLVL3 = achievement.achievementLVL3
      this.EachievementLVL4 = achievement.achievementLVL4
      this.EachievementLVL5 = achievement.achievementLVL5
      this.EachievementLVL1amount = achievement.achievementLVL1amount
      this.EachievementLVL2amount = achievement.achievementLVL2amount
      this.EachievementLVL3amount = achievement.achievementLVL3amount
      this.EachievementLVL4amount = achievement.achievementLVL4amount
      this.EachievementLVL5amount = achievement.achievementLVL5amount
      this.EachievementActive = achievement.achievementActive
      this.EachievementActiveEnd = achievement.achievementActiveEnd
      this.EachievementPublish = achievement.achievementPublish
      this.EachievementID = achievement.achievementID
      this.editAchievementVisible = true
    },
    postDelAchievement: function () {
      this.loadingDel = true
      axios.post('/admin/achievement/delete', {
        achievementID: this.EachievementID,
        achievementGroup: this.EachievementGroup
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.loadingDel = false
        this.$notify({
          title: 'Success',
          message: 'Viikkotehtävä poistettu',
          type: 'success'
        })
        this.editAchievementVisible = false
        this.getAchievements()
      }).catch(err => {
        console.log(err)
        this.loadingDel = false
        this.$notify({
          title: 'Virhe',
          message: 'Poisto ei onnistunut',
          type: 'error'
        })
      })
    },
    showAchievement: function (achievementID, event) {
      this.loading = true
    }
  },
  filters: {
    date: function (value) {
      return moment(String(value)).format('DD.MM.YYYY HH:mm')
    }
  },
  created () {
    this.getAchievements()
  }

}
</script>

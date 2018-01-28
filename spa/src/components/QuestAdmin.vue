<template>
  <div>
        <div style="text-align: center;">
          <el-button type="primary" @click="addQuestVisible = true" round>Lisää viikkotehtävä</el-button>
            Näytä: <el-select v-model="questFilter" placeholder="Heimo">
              <el-option
                  v-for="item in groupFilter"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select></div>
      <hr>
      <el-row>
      <el-col :span="24">
        <div class="columns medium-3" v-for="quest in quests">
          <div class="card" v-show="questFilter == quest.groupID || questFilter == 'Kaikki'">
            <div class="card-divider">
              {{ quest.name }} | {{ quest.groupID }}
            </div>
            <div class="card-section">
              <p>{{ quest.questActive }}</p>
              <el-button type="primary" round @click="editQuest(quest.questID)">Muokkaa</el-button> 
              <el-button type="primary" round @click="showQuest(quest.questID)">Suoritukset</el-button> 
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row>
    </el-row>
    <el-dialog
        title="Lisää viikkotehtävä"
        :visible.sync="addQuestVisible"
        width="80%">
        Tehtävän nimi
        <el-input v-model="questName" placeholder="Tehtävän nimi"></el-input>
        Tehtävän kuvaus
        <el-input v-model="questDesc" placeholder="Kuvaus" type="textarea"></el-input>
        Tarina
        <el-input v-model="questStory" placeholder="Tarina" type="textarea"></el-input>
        Onnistumisviesti
        <el-input v-model="questSuccess" placeholder="Onnistumisviesti" type="textarea"></el-input>
        Epäonnistumisviesti
        <el-input v-model="questFailure" placeholder="Epäonnistumisviesti" type="textarea"></el-input>
        <el-row>
          <el-col :xs=24 :sm=12>
            <el-radio v-model="questScope" label="1">Yksilö</el-radio>
            <el-radio v-model="questScope" label="2">Heimo</el-radio>
          </el-col>
          <el-col :xs=24 :sm=12>
            <el-select v-model="questGroup" placeholder="Heimo">
              <el-option
                  v-for="item in groups"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
 
         </el-col>
        </el-row>
        <el-row>
          <el-col :xs=24 :sm=12>
            <el-radio v-model="questRepeat" label="1">Viikossa</el-radio>
            <el-radio v-model="questRepeat" label="2">
            <el-input-number v-model="questDays" placeholder="Päivää"></el-input-number> päivänä</el-radio>
          </el-col>
          <el-col :xs=24 :sm=12>
            <el-radio v-model="questType" label="1">Suoritus</el-radio>
            <el-radio v-model="questType" label="2">Määrä</el-radio>
            <el-container v-show="questType == 2">
              Vaadittu suoritus:<br/>
            <el-input-number  v-model="amount" :min="1" :step="1"></el-input-number>
            <el-input v-model="questMeasure" placeholder="Yksikkö"></el-input>
            </el-container>
 
 
         </el-col>
        </el-row>
        <el-row>
        <el-col :span=6>
        Tehtävän aloituspäivä<br>
        <el-date-picker
                  v-model="questActive"
                  :picker-options="datePickerOpts"
                  placeholder="Tehtäväviikko">
        </el-date-picker>
         </el-col>
        <el-col :span=6>
        Tehtävän julkaisupäivä<br>
        <el-date-picker
                  v-model="questPublish"
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
          <el-button @click.native="addQuestVisible = false" round>Peruuta</el-button>
          <el-button type="primary"  :loading="loadingSend" round @click.prevent="postAddQuest">Lähetä</el-button>
        </span>
    </el-dialog>

    <el-dialog
        title="Muokkaa viikkotehtävää"
        :visible.sync="editQuestVisible"
        width="80%">
        Tehtävän nimi
        <el-input v-model="EquestName" placeholder="Tehtävän nimi"></el-input>
        Tehtävän kuvaus
        <el-input v-model="EquestDesc" placeholder="Kuvaus" type="textarea"></el-input>
        Tarina
        <el-input v-model="EquestStory" placeholder="Tarina" type="textarea"></el-input>
        Onnistumisviesti
        <el-input v-model="EquestSuccess" placeholder="Onnistumisviesti" type="textarea"></el-input>
        Epäonnistumisviesti
        <el-input v-model="EquestFailure" placeholder="Epäonnistumisviesti" type="textarea"></el-input>
        <el-row>
          <el-col :xs=24 :sm=12>
            <el-radio v-model="EquestScope" label="1">Yksilö</el-radio>
            <el-radio v-model="EquestScope" label="2">Heimo</el-radio>
          </el-col>
          <el-col :xs=24 :sm=12>
            <el-select v-model="EquestGroup" placeholder="Heimo">
              <el-option
                  v-for="item in groups"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
 
         </el-col>
        </el-row>
        <el-row>
          <el-col :xs=24 :sm=12>
            <el-radio v-model="EquestRepeat" label="1">Viikossa</el-radio>
            <el-radio v-model="EquestRepeat" label="2">
            <el-input-number v-model="EquestDays" placeholder="Päivää"></el-input-number> päivänä</el-radio>
          </el-col>
          <el-col :xs=24 :sm=12>
            <el-radio v-model="EquestType" label="1">Suoritus</el-radio>
            <el-radio v-model="EquestType" label="2">Määrä</el-radio>
            <el-container v-show="EquestType == 2">
              Vaadittu suoritus:<br/>
            <el-input-number  v-model="amount" :min="1" :step="1"></el-input-number>
            <el-input v-model="EquestMeasure" placeholder="Yksikkö"></el-input>
            </el-container>
 
 
         </el-col>
        </el-row>
        <el-row>
          <el-col :span=6>
            Tehtävän aloituspäivä<br>
            <el-date-picker
                                              v-model="EquestActive"
                                              :picker-options="datePickerOpts"
                                              placeholder="Tehtäväviikko">
            </el-date-picker>
          </el-col>
          <el-col :span=6>
            Tehtävän julkaisupäivä<br>
            <el-date-picker
                                              v-model="EquestPublish"
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
          <el-button @click.native="editQuestVisible = false" round>Peruuta</el-button>
          <el-button type="danger" :loading="loadingDel" @click.native="postDelQuest" round>Poista</el-button>
          <el-button type="primary" :loading="loadingSend" round @click.prevent="postEditQuest">Tallenna</el-button>
        </span>
    </el-dialog>



  </div>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
Vue.use(axios)
export default {
  data () {
    return {
      quests: [
      ],
      loadingSend: false,
      loadingDel: false,
      addQuestVisible: false,
      editQuestVisible: false,
      questFilter: 'Kaikki',
      questName: ' ',
      questType: ' ',
      questDesc: ' ',
      questGroup: '',
      questStory: ' ',
      questSuccess: ' ',
      questFailure: ' ',
      questDays: 0,
      amount: 0,
      questMeasure: ' ',
      questRepeat: ' ',
      questActive: ' ',
      questPublish: ' ',
      datePickerOpts: {
        firstDayOfWeek: 1
      },
      questScope: '1',
      groupFilter: [{
        value: 'Kaikki',
        label: 'Kaikki'
      }, {
        value: 'Kekäle',
        label: 'Kekäle'
      }, {
        value: 'Kvantti',
        label: 'Kvantti'
      }, {
        value: 'Loharit',
        label: 'Loharit'
      }, {
        value: 'Lopparit',
        label: 'Lopparit'
      }, {
        value: 'Manse',
        label: 'Manse'
      }, {
        value: 'Pöllöt',
        label: 'Pöllöt'
      }, {
        value: 'Tammi',
        label: 'Tammi'
      }, {
        value: 'Karhut',
        label: 'Karhut'
      }, {
        value: 'UH1',
        label: 'UH1'
      }, {
        value: 'UH2',
        label: 'UH2'
      }],
      groups: [{
        value: 'Kekäle',
        label: 'Kekäle'
      }, {
        value: 'Kvantti',
        label: 'Kvantti'
      }, {
        value: 'Loharit',
        label: 'Loharit'
      }, {
        value: 'Lopparit',
        label: 'Lopparit'
      }, {
        value: 'Manse',
        label: 'Manse'
      }, {
        value: 'Pöllöt',
        label: 'Pöllöt'
      }, {
        value: 'Tammi',
        label: 'Tammi'
      }, {
        value: 'Karhut',
        label: 'Karhut'
      }, {
        value: 'UH1',
        label: 'UH1'
      }, {
        value: 'UH2',
        label: 'UH2'
      }],
      EquestName: ' ',
      EquestType: ' ',
      EquestDesc: ' ',
      EquestGroup: '',
      EquestStory: ' ',
      EquestSuccess: ' ',
      EquestFailure: ' ',
      EquestDays: ' ',
      Eamount: 0,
      EquestMeasure: ' ',
      EquestRepeat: ' ',
      EquestActive: ' ',
      EquestPublish: ' ',
      EquestScope: '1',
      EquestID: ''
    }
  },
  methods: {
    getQuests: function () {
      axios.get('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/admin/quest')
        .then(response => { this.quests = response.data.quests })
    },
    postAddQuest: function () {
      this.loadingSend = true
      axios.post('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/admin/quest/add', {
        questName: this.questName,
        questType: this.questType,
        questGroup: this.questGroup,
        amount: parseInt(this.amount),
        questDesc: this.questDesc,
        questStory: this.questStory,
        questSuccess: this.questSuccess,
        questFailure: this.questFailure,
        questMeasure: this.questMeasure,
        questActive: this.questActive,
        questPublish: this.questPublish,
        questDays: this.questDays,
        questRepeat: this.questRepeat,
        questScope: this.questScope
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.$notify({
          title: 'Success',
          message: 'Viikkotehtävä lisätty',
          type: 'success'
        })
        this.addQuestVisible = false
        this.loadingSend = false
        this.getQuests()
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
    postEditQuest: function () {
      this.loadingSend = true
      axios.post('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/admin/quest/update', {
        questID: this.EquestID,
        questName: this.EquestName,
        questType: this.EquestType,
        questGroup: this.EquestGroup,
        questGroupOld: this.EquestGroupOld,
        amount: parseInt(this.Eamount),
        questDesc: this.EquestDesc,
        questStory: this.EquestStory,
        questSuccess: this.EquestSuccess,
        questFailure: this.EquestFailure,
        questMeasure: this.EquestMeasure,
        questActive: this.EquestActive,
        questPublish: this.EquestPublish,
        questDays: this.EquestDays,
        questScope: this.questScope,
        questRepeat: this.EquestRepeat
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.$notify({
          title: 'Success',
          message: 'Viikkotehtävä tallennettu',
          type: 'success'
        })
        this.editQuestVisible = false
        this.loadingSend = false
        this.getQuests()
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
    editQuest: function (questID) {
      console.log(questID)
      var quest = this.quests.find(quest => { return quest.questID === questID })
      this.EquestName = quest.name
      this.EquestType = quest.type
      this.EquestDesc = quest.questDesc
      this.EquestGroup = quest.groupID
      this.EquestGroupOld = quest.groupID
      this.EquestStory = quest.questStory
      this.EquestSuccess = quest.questSuccess
      this.EquestFailure = quest.questFailure
      this.EquestDays = quest.questDays
      this.Eamount = quest.amount
      this.EquestMeasure = quest.questMeasure
      this.EquestRepeat = quest.questRepeat
      this.EquestActive = quest.questActive
      this.EquestPublish = quest.questPublish
      this.EquestScope = quest.questScope
      this.EquestID = quest.questID
      this.editQuestVisible = true
    },
    postDelQuest: function () {
      this.loadingDel = true
      axios.post('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/admin/quest/delete', {
        questID: this.EquestID,
        questGroup: this.EquestGroup
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.loadingDel = false
        this.$notify({
          title: 'Success',
          message: 'Viikkotehtävä poistettu',
          type: 'success'
        })
        this.editQuestVisible = false
        this.getQuests()
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
    showQuest: function (questID, event) {
      this.loading = true
    }
  },
  created () {
    this.getQuests()
  }

}
</script>

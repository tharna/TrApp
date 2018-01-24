<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="columns medium-3" v-for="quest in quests">
          <div class="card">
            <div class="card-divider">
              {{ quest.name }}
            </div>
            <div class="card-section">
              <p>{{ quest.type }}: {{ quest.amount }}</p>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <hr>
        <div style="text-align: center;"><el-button type="primary" @click="addQuestVisible = true" round>Lisää viikkotehtävät</el-button></div>
      </el-col>
    </el-row>
    <el-dialog
        title="Lisää viikkotehtävä"
        :visible.sync="addQuestVisible"
        width="80%">
        <el-input v-model="questName" placeholder="Tehtävän nimi"></el-input>
        <el-input v-model="questDesc" placeholder="Kuvaus" type="textarea"></el-input>
        <el-input v-model="questSuccess" placeholder="Onnistumisviesti" type="textarea"></el-input>
        <el-input v-model="questFailure" placeholder="Epäonnistumisviesti" type="textarea"></el-input>
        <el-row>
          <el-col :span="6">
            <el-radio v-model="questScope" label="1">Yksilö</el-radio>
            <el-radio v-model="questScope" label="2">Heimo</el-radio>
          </el-col>
          <el-col :span="6">
            <el-radio v-model="questType" label="1">Toistot</el-radio>
            <el-radio v-model="questType" label="2">Määrä</el-radio>
          </el-col>
          <el-col :span="6">
            <el-radio v-model="questRepeat" label="1">Per päivä</el-radio>
            <el-radio v-model="questRepeat" label="2">Per viikko</el-radio>
          </el-col>

          <!--el-col :span="8">
            <el-select v-model="questType" placeholder="Tyyppi">
               <el-option
                  v-for="item in questTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
              </el-option>
            </el-select>
          </el-col-->
          <el-col :span="6">
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

        <el-date-picker
                  v-model="questActive"
                  type="week"
                  format="Viikko WW"
                  :picker-options="datePickerOpts"
                  placeholder="Tehtäväviikko">
        </el-date-picker>
        <el-date-picker
                  v-model="questPublish"
                  type="date"
                  :picker-options="datePickerOpts"
                  placeholder="Tehtävä julkaisu">
        </el-date-picker>
        <el-row>
          <el-col :span="24">
            Vaadittu suoritus:
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">
            <el-input-number v-model="amount" :min="1" :step="1"></el-input-number>
          </el-col>
          <el-col :span="4">
            <el-input v-model="questMeasure" placeholder="Yksikkö"></el-input>
          </el-col>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button @click.native="addQuestVisible = false" round>Peruuta</el-button>
          <el-button type="primary" round @click.prevent="postAddQuest">Lähetä</el-button>
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
      addQuestVisible: false,
      questName: '',
      questType: '',
      questDesc: '',
      questGroup: '',
      questSuccess: '',
      questFailure: '',
      amount: 0,
      questMeasure: '',
      questActive: '',
      questPublish: '',
      datePickerOpts: {
        firstDayOfWeek: 1
      },
      questScope: '1',
      groups: [{
        value: 1,
        label: 'Kekäle'
      }, {
        value: 2,
        label: 'Kvantti'
      }, {
        value: 3,
        label: 'Loharit'
      }, {
        value: 4,
        label: 'Lopparit'
      }, {
        value: 5,
        label: 'Manse'
      }, {
        value: 6,
        label: 'Pöllöt'
      }, {
        value: 7,
        label: 'Tammi'
      }, {
        value: 8,
        label: 'Karhut'
      }],
      questTypes: [{
        value: 1,
        label: 'Toistot (per viikko)'
      }, {
        value: 2,
        label: 'Määrä (per päivä)'
      }, {
        value: 3,
        label: ''
      }, {
        value: 4,
        label: ''
      }, {
        value: 5,
        label: ''
      }]
    }
  },
  methods: {
    getQuests: function () {
      axios.get('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/admin/quest')
        .then(response => { this.quests = response.data.quests })
    },
    postAddQuest: function () {
      axios.post('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/admin/quest/add', {
        questName: this.questName,
        questType: this.questType,
        questGroup: this.questGroup,
        amount: parseInt(this.amount),
        questDesc: this.questDesc,
        questSuccess: this.questSuccess,
        questFailure: this.questFailure,
        questMeasure: this.questMeasure,
        questActive: this.questActive,
        questPublish: this.questPublish
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.$notify({
          title: 'Success',
          message: 'Viikkotehtävä lisätty',
          type: 'success'
        })
      })
      this.addQuestVisible = false
    }
  },
  created () {
    this.getQuests()
  }

}
</script>

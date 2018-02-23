<template>
  <div>
    <el-row>
      <el-col :xs="24" :sm="12" :md="8" :lg="6" style="padding: 10px;" v-for="quest in quests">
          <div class="card">
            <div class="card-divider" v-bind:class="questType(quest)">
              {{ quest.name }}<br>{{ quest.startDate | date }} - {{ quest.endDate | date }}
            </div>
            <div class="card-section">
              <el-progress :percentage="quest.progress" :stroke-width="16"></el-progress>
              <div class="bottom clearfix" style="margin-top: 10px;">
              <el-button round @click="showQuestActivity(quest.questID)">Näytä tiedot</el-button>
              <el-button v-if="quest.isActive" type="primary" round @click="addQuestActivity(quest.questID)">Lisää suoritus</el-button>
              </div>
            </div>
          </div>
      </el-col>
    </el-row>

    <el-dialog
        title="Lisää suoritus"
        :visible.sync="addQuestActivityVisible"
        width="80%">
          {{ currentQuest.questDesc }}<br>
        <span v-if="currentQuest.type==1">
          Tehtävä suoritettu:<br>
          <el-button @click.native="addQuestActivityVisible = false" round>Ei</el-button>
          <el-button type="primary" :loading="loading" round @click.prevent="postQuest(currentQuest.questID)">Kyllä</el-button>


        </span>
        <el-input-number v-if="currentQuest.type==2 "v-model="questActivity"></el-input-number> {{ currentQuest.questMeasure }}
          <span v-if="currentQuest.type==2" slot="footer" class="dialog-footer">
            <el-button @click.native="addQuestActivityVisible = false" round>Peruuta</el-button>
            <el-button type="primary" :loading="loading" round @click.prevent="postQuest(currentQuest.questID)">Tallenna</el-button>
          </span>
    </el-dialog>
    <el-dialog
        :title="currentQuest.name"
        :visible.sync="showQuestActivityVisible"
        width="80%">
      <p>{{ currentQuest.questDesc }}</p>
      <p>{{ currentQuest.questStory }}</p>
      <p v-if="currentQuest.status == 'success'">{{ currentQuest.questSuccess }}</p>
      <p v-if="currentQuest.status == 'failure'">{{ currentQuest.questFailure }}</p>
          <span slot="footer" class="dialog-footer">
      <el-button @click.native="showQuestActivityVisible = false" round>OK</el-button>
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
  props: ['activeName'],
  data () {
    return {
      quests: [
      ],
      currentQuest: {},
      addQuestActivityVisible: false,
      showQuestActivityVisible: false,
      loading: false,
      loaded: false,
      questActivity: 1
    }
  },
  methods: {
    getQuests: function () {
      axios.get('/data/quest')
        .then(response => {
          this.quests = response.data.quests.sort(function (b, a) {
            if (a.grandQuest) return 1
            if (b.grandQuest) return -1
            if (a.startDate > b.startDate) return 1
            if (a.startDate < b.startDate) return -1
          })
        })
    },
    postQuest: function (questID) {
      this.loading = true
      axios.post('/data/quest', {
        questID: questID,
        groupID: this.currentQuest.groupID,
        questActivity: this.questActivity
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.loading = false
        this.$notify({
          title: 'Success',
          message: 'Lisätty onnistuneesti',
          type: 'success'
        })
        this.editQuestVisible = false
        this.getQuests()
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
    addQuestActivity: function (questID) {
      this.currentQuest = this.quests.find(quest => { return quest.questID === questID })
      this.addQuestActivityVisible = true
    },
    showQuestActivity: function (questID) {
      this.currentQuest = this.quests.find(quest => { return quest.questID === questID })
      this.showQuestActivityVisible = true
    },
    questType: function (quest) {
      if (quest.grandQuest) return 'grand'
      if (quest.isActive) return 'active'
      return quest.status
    }
  },
  filters: {
    date: function (value) {
      return moment(String(value)).format('DD.MM.YYYY')
    }
  },
  watch: {
    activeName: function () {
      if (this.activeName === 'third' && this.loaded === false) {
        this.getQuests()
      }
    }
  }

}
</script>
<style>
.card .success {
  background-color: #13ce66; 
  color: #fff;
}
.card .failure {
  background-color: #ff4949; 
  color: #fff;
}
.card .inprogress {
  background-color: #20a0ff; 
  color: #fff;
}
.card .upcoming {
}
.grand {
  background-color: #6A5ACD;
  color: #fff;
}
.active {
  background-color: #20a0ff;
  color: #fff;
}
.el-progress__text {
  margin-left: 8px;
}


</style>

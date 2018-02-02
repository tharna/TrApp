<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="columns medium-3" v-for="quest in quests">
          <div class="card">
            <div class="card-divider upcoming" v-bind:class="quest.type">
              {{ quest.name }}
            </div>
            <div class="card-section">
              <el-progress :percentage="quest.progress" :stroke-width="16"></el-progress>
              <div class="bottom clearfix" style="margin-top: 10px;">
              <el-button round @click="showQuestActivity(quest.questID)">Näytä tiedot</el-button>
              <el-button v-if="quest.isActive" type="primary" round @click="addQuestActivity(quest.questID)">Lisää suoritus</el-button>
              </div>
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
Vue.use(axios)
export default {
  data () {
    return {
      quests: [
      ],
      currentQuest: {},
      addQuestActivityVisible: false,
      showQuestActivityVisible: false,
      loading: false,
      questActivity: 1
    }
  },
  methods: {
    getQuests: function () {
      axios.get('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/data/quest')
        .then(response => { this.quests = response.data.quests })
    },
    postQuest: function (questID) {
      this.loading = true
      axios.post('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/data/quest', {
        questID: questID,
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
    }
  },
  created () {
    this.getQuests()
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

</style>

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
              <el-button v-if="!quest.isActive" type="primary" round @click="addQuestActivityVisible=true">Lisää suoritus</el-button>
            </div>
          </div>
          <el-dialog
                                               title="Lisää suoritus"
                                               :visible.sync="addQuestActivityVisible"
                                               width="80%">
            <form>
              <el-input v-model="questActivity"></el-input>
              <el-button @click.native="addQuestActivityVisible = false" round>Peruuta</el-button>
              <el-button type="primary" :loading="loading" round @click.prevent="postQuest(quest.questID)">Tallenna</el-button>
            </form>
          </el-dialog>
        </div>
      </el-col>
    </el-row>
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
      addQuestActivityVisible: false,
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
    }
  },
  created () {
    this.getQuests()
  }

}
</script>

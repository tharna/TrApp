<template>
  <div>
<el-table
    :data="users"
    :default-sort = "{prop: 'total', order: 'descending'}"
    style="width: 100%">
    <el-table-column
      prop="userID"
      label="Pelaaja"
      sortable>
    </el-table-column>
    <el-table-column
      prop="group"
      label="Heimo"
      :filter-method="filterGroup"
      :filters="[{ text: 'Kekäle', value: 'Kekäle' }, { text: 'Kvantti', value: 'Kvantti' }, { text: 'Loharit', value: 'Loharit' }, { text: 'Lopparit', value: 'Lopparit' }, { text: 'Manse', value: 'Manse' }, { text: 'Pöllöt', value: 'Pöllöt' }, { text: 'Tammi', value: 'Tammi' }, { text: 'Karhut', value: 'Karhut' }, { text: 'Iku', value: 'Iku' }, { text: 'Mekanistit', value: 'Mekanistit' }, { text: 'NPC', value: 'NPC' }, { text: 'PJ', value: 99}]"
      filter-placement="bottom-end"
      sortable>
    </el-table-column>
    <el-table-column
      prop="level.air"
      label="Ilma"
      :formatter="level"
      sortable>
    </el-table-column>
    <el-table-column
      prop="level.earth"
      label="Maa"
      :formatter="level"
      sortable>
    </el-table-column>
    <el-table-column
      prop="level.fire"
      label="Tuli"
      :formatter="level"
      sortable>
    </el-table-column>
    <el-table-column
      prop="level.water"
      label="Vesi"
      :formatter="level"
      sortable>
    </el-table-column>

    <el-table-column
      prop="total"
      label="Aktiivisuus"
      sortable>
    </el-table-column>
    <el-table-column>
      <template slot-scope="scope">
        <el-button type="primary" round @click="getUserAchievements(scope.row.userID)">Urotyöt</el-button> 
      </template>
    </el-table-column>
  </el-table>
   <el-dialog
       title="Pelaajan suorittamat urotyöt"
       :visible.sync="showUserAchievementsVisible"
       width="80%">
     <el-table
       :data="userAchievements"
       style="width: 100%">
       <el-table-column
       prop="name"
       label="Urotyö"
       sortable>
       </el-table-column>
       <el-table-column
       prop="level"
       label="Taso"
       sortable>
       </el-table-column>
     </el-table> 
         <el-button @click.native="showUserAchievementsVisible = false" round>Sulje</el-button>
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
      users: [
      ],
      userAchievements: [
      ],
      showUserAchievementsVisible: false
    }
  },
  methods: {
    getUsers: function () {
      axios.get('/admin/user')
        .then(response => { this.users = response.data.users })
    },
    getUserAchievements: function (userID) {
      axios.get('/admin/user/achievement/' + userID)
        .then(response => {
          this.userAchievements = response.data.achievements
          this.showUserAchievementsVisible = true
        })
    },
    filterGroup: function (value, row) {
      return row.group === value
    },
    level: function (row, column, value, index) {
      var sum = 0
      var level = 0
      const levelMultiplier = 8
      while (sum <= value) {
        level++
        value = value - sum
        sum = level * levelMultiplier
      }
      return level - 1
    }
  },
  created () {
    this.getUsers()
  }
}
</script>

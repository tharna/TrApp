<template>
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
  </el-table>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
Vue.use(axios)
export default {
  data () {
    return {
      users: [
      ]
    }
  },
  methods: {
    getUsers: function () {
      axios.get('/admin/user')
        .then(response => { this.users = response.data.users })
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

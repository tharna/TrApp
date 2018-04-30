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
      sortable>
    </el-table-column>
    <el-table-column
      prop="level.earth"
      label="Maa"
      sortable>
    </el-table-column>
    <el-table-column
      prop="level.fire"
      label="Tuli"
      sortable>
    </el-table-column>
    <el-table-column
      prop="level.water"
      label="Vesi"
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
    }
  },
  created () {
    this.getUsers()
  }
}
</script>

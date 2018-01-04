<template>
  <div>
    <el-row>
      <el-col :span="24">
        Aktiivisuus viimeisen viikon aikana:
        <trend
        :data="activity"
        :gradient="['#ff0000', '#ff5d00', '#ffff00', '#00ff00']"
        :stroke-width="4"
        auto-draw
        smooth>
        </trend>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        Heimon viikkotavoite:
        <el-progress :percentage="20" :stroke-width="16" @click.native="heimoDialogVisible = true"></el-progress>
        <el-dialog
          title="Heimon viikkotavoite"
          :visible.sync="heimoDialogVisible"
          width="80%">
          <span>Juoskaa yhteensä 100 km</span><br>
          Suoritus: <input type="text">
          <span slot="footer" class="dialog-footer">
            <el-button @click.native="heimoDialogVisible = false" round>Peruuta</el-button>
            <el-button type="primary" @click.native="heimoDialogVisible = false" round>Lähetä</el-button>
          </span>
        </el-dialog>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        Henkilökohtainen viikkotavoite:
        <el-progress :percentage="100" :stroke-width="16" status="success" @click.native="omaDialogVisible = true"></el-progress>
        <el-dialog
                                                          title="Henkilökohtainen viikkotavoite"
                                                          :visible.sync="omaDialogVisible"
                                                          width="80%">
          <span>Venyttele joka päivä.</span><br>
          <span slot="footer" class="dialog-footer">
            Suoritettu: 
            <el-button @click.native="omaDialogVisible = false" round>Ei</el-button>
            <el-button type="primary" @click.native="omaDialogVisible = false" round>Kyllä</el-button>
          </span>
        </el-dialog>
      </el-col>
    </el-row>

    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :lg="12">
        Tuli (Taso {{ user.current.fire }}):
        <el-progress :percentage="user.level.fire" :stroke-width="16" status="exception"></el-progress>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        Vesi (Taso {{ user.current.water }}):
        <el-progress :percentage="user.level.water" :stroke-width="16"></el-progress>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :lg="12">
        Maa (Taso {{ user.current.earth }}):
        <el-progress :percentage="user.level.earth" :stroke-width="16" status="success"></el-progress>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        Ilma (Taso {{ user.current.air }}):
        <el-progress :percentage="user.level.air" :stroke-width="16"></el-progress>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <conditional-select :categories="categories" :subcategories="subcategories" v-model="treeni" @update="getUserData"></conditional-select>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import ConditionalSelect from './ConditionalSelect.vue'
import Vue from 'vue'
import Trend from 'vuetrend'
import axios from 'axios'

Vue.use(Trend)

export default {
  data () {
    return {
      treeni: {laji: 0, amount: ''},
      heimoDialogVisible: false,
      omaDialogVisible: false,
      actions: [
        { name: 'Kyllä' },
        { name: 'Ei' }
      ],
      categories: [
        { id: '0', name: '-- Valitse laji --', selected: true },
        { id: '1', name: 'Juoksu', selected: true },
        { id: '2', name: 'Uinti', selected: false },
        { id: '3', name: 'Pyöräily', selected: false },
        { id: '4', name: 'Kuntosali', selected: false },
        { id: '5', name: 'Hyötyliikunta', selected: false },
        { id: '6', name: 'Kyykky', selected: false },
        { id: '7', name: 'Punnerrus', selected: false }
      ],
      subcategories: [
        { id: '1', category_id: '1', name: 'Matka', selected: true },
        { id: '2', category_id: '2', name: 'Matka', selected: true },
        { id: '3', category_id: '3', name: 'Matka', selected: true },
        { id: '4', category_id: '4', name: 'Aika', selected: true },
        { id: '5', category_id: '5', name: 'Aika', selected: true },
        { id: '6', category_id: '6', name: 'Toistot', selected: true },
        { id: '7', category_id: '7', name: 'Toistot', selected: true }
      ],
      activity: [],
      user: []

    }
  },
  components: {
    ConditionalSelect
  },
  methods: {
    getActivity: function () {
      axios.get('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/data/activity')
        .then(response => {
          this.activity = response.data.activity.map((amount) => { return amount.total })
        })
    },
    getUserData: function () {
      axios.get('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/data/user')
        .then(response => { this.user = response.data.user })
      console.log(this.activity)
    }
  },
  created () {
    this.getActivity()
    this.getUserData()
  }

}
</script>

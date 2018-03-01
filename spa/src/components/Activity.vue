<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div style="padding: 5px 20px; text-align: center;">
          <el-button @click="addExerciseVisible = true" type="primary" round>Lisää suoritus</el-button>
    </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        Aktiivisuus: <el-radio v-model="period" @change="getActivity" label="Viikko">Viikko</el-radio>
        <el-radio v-model="period" @change="getActivity" label="Kuukausi">Kuukausi</el-radio>
        <el-radio v-model="period" @change="getActivity" label="Treenijakso">Treenijakso</el-radio>
        <trend
        :data="activity"
        :gradient="['#ff0000', '#ff5d00', '#ffff00', '#bfff00', '#80ff00', '#40ff00', '#00ff00']"
        :stroke-width="2"
        auto-draw
        smooth>
        </trend>
      </el-col>
    </el-row>

    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :lg="12">
        Tuli (Taso {{ user.current.fire }}):
        <el-progress-xp :percentage="user.level.fire" :stroke-width="16" color="red"></el-progress-xp>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        Vesi (Taso {{ user.current.water }}):
        <el-progress-xp :percentage="user.level.water" :stroke-width="16" color="blue"></el-progress-xp>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :lg="12">
        Maa (Taso {{ user.current.earth }}):
        <el-progress-xp :percentage="user.level.earth" :stroke-width="16" color="green"></el-progress-xp>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        Ilma (Taso {{ user.current.air }}):
        <el-progress-xp color="yellow" :percentage="user.level.air" :stroke-width="16"></el-progress-xp>
      </el-col>
    </el-row>
        <el-dialog
            title="Lisää suoritus"
            :visible.sync="addExerciseVisible"
            width="80%">
        <conditional-select :categories="categories" :subcategories="subcategories" v-model="treeni" @update="updateData"></conditional-select>
        </el-dialog>
  </div>
</template>
<script>
import ConditionalSelect from './ConditionalSelect.vue'
import Vue from 'vue'
import Trend from 'vuetrend'
import axios from 'axios'
import ElProgressXp from './progressXp.vue'

Vue.use(Trend)

export default {
  data () {
    return {
      treeni: {laji: 0, amount: '', type: 0},
      addExerciseVisible: false,
      actions: [
        { name: 'Kyllä' },
        { name: 'Ei' }
      ],
      categories: [
        { id: '0', name: '-- Valitse laji --', selected: true },
        { id: '1', name: 'Lihaskunto', selected: true },
        { id: '2', name: 'Kestävyys', selected: false },
        { id: '3', name: 'Ketteryys', selected: false },
        { id: '4', name: 'Kehonhuolto', selected: false }
      ],
      subcategories: [
        { id: '1', category_id: '1', name: 'Kuntosali', selected: true },
        { id: '2', category_id: '1', name: 'Bodypump', selected: false },
        { id: '3', category_id: '1', name: 'Kamppailulajit', selected: false },
        { id: '4', category_id: '1', name: 'Megazone', selected: false },
        { id: '5', category_id: '1', name: 'Ammunta', selected: false },
        { id: '6', category_id: '1', name: 'Boffaus', selected: false },
        { id: '100', category_id: '1', name: 'Muu lihaskunto', selected: false },
        { id: '7', category_id: '2', name: 'Pyöräily', selected: true },
        { id: '8', category_id: '2', name: 'Uinti', selected: false },
        { id: '9', category_id: '2', name: 'Juoksu', selected: false },
        { id: '10', category_id: '2', name: 'Kävely', selected: false },
        { id: '11', category_id: '2', name: 'Hölkkä', selected: false },
        { id: '12', category_id: '2', name: 'Cardio', selected: false },
        { id: '13', category_id: '2', name: 'HIIT', selected: false },
        { id: '14', category_id: '2', name: 'Luistelu', selected: false },
        { id: '30', category_id: '2', name: 'Hiihto', selected: false },
        { id: '101', category_id: '2', name: 'Muu kestävyys', selected: false },
        { id: '15', category_id: '3', name: 'Tanssilajit', selected: true },
        { id: '16', category_id: '3', name: 'Pallolajit', selected: false },
        { id: '17', category_id: '3', name: 'Parkour', selected: false },
        { id: '18', category_id: '3', name: 'Kiipeily', selected: false },
        { id: '19', category_id: '3', name: 'Mailalajit', selected: false },
        /* { id: '20', category_id: '3', name: 'Yökerhotanssi', selected: false }, */
        { id: '102', category_id: '3', name: 'Muu ketteryys', selected: false },
        { id: '21', category_id: '4', name: 'Venyttely', selected: true },
        { id: '22', category_id: '4', name: 'Jooga', selected: false },
        { id: '23', category_id: '4', name: 'Vesijuoksu', selected: false },
        { id: '24', category_id: '4', name: 'Tasapainoharjoittelu', selected: false },
        { id: '25', category_id: '4', name: 'Kehonhuolto', selected: false },
        { id: '26', category_id: '4', name: 'Snorklaus', selected: false },
        { id: '27', category_id: '4', name: 'Fysioterapia', selected: false },
        { id: '28', category_id: '4', name: 'hyötyliikunta', selected: false },
        { id: '29', category_id: '4', name: 'rauhalliset lajit', selected: false },
        { id: '103', category_id: '4', name: 'Muu kehonhuolto', selected: false }
      ],
      activity: [],
      activity_cache: [],
      user: {
        current: [],
        level: []
      },
      period: 'Viikko'

    }
  },
  components: {
    ConditionalSelect,
    ElProgressXp
  },
  methods: {
    getActivity: function () {
      if (!(this.period in this.activity_cache)) {
        axios.get('/data/activity', {params: {period: this.period}})
          .then(response => {
            this.activity_cache[this.period] = response.data.activity // .activity.map((amount) => { return amount.total })
            this.activity = this.activity_cache[this.period]
          })
      } else {
        this.activity = this.activity_cache[this.period]
      }
    },
    getUserData: function () {
      axios.get('/data/user')
        .then(response => { this.user = response.data.user })
    },
    updateData: function () {
      this.getUserData()
      this.activity_cache = []
      this.getActivity()
      this.addExerciseVisible = false
      this.$emit('update')
    }
  },
  created () {
    this.getActivity()
    this.getUserData()
  }

}
</script>

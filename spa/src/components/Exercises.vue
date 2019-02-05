<template>
  <div>
    <el-row>
      <el-col :xs="12" :sm="6" :md="4">
         <el-radio v-model="type" label="Kaikki">Kaikki</el-radio>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
         <el-radio class="Lihaskunto" style="padding: 8px; border-radius: 15px;" v-model="type" label="Lihaskunto">Lihaskunto</el-radio>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
         <el-radio class="Ketteryys" style="padding: 8px; border-radius: 15px;" v-model="type" label="Ketteryys">Ketteryys</el-radio>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
         <el-radio class="Kestävyys" style="padding: 8px; border-radius: 15px;" v-model="type" label="Kestävyys">Kestävyys</el-radio>
      </el-col>
      <el-col :xs="12" :sm="6" :md="4">
         <el-radio class="Kehonhuolto" style="padding: 8px; border-radius: 15px;" v-model="type" label="Kehonhuolto">Kehonhuolto</el-radio>
      </el-col>
    </el-row>
        <hr>
    <el-row v-loading="exercisesLoading">
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6" style="padding: 10px;" v-for="(exercise, index) in filteredExercises">
          <div class="card">
            <div class="card-divider" v-bind:class="exercise.exercisename">
              {{ exercise.exercisetype }} {{ exercise.amount | time }} 
              <!--el-rate
                 style="display: inline-block; float: right;"
                 disabled
                 :max="3"
                 :low-threshold="1"
                 :high-threshold="3"
                 :icon-classes="['el-icon-circle-check-m', 'el-icon-circle-check-m', 'el-icon-circle-check-m']"
                 disabled-void-icon-class="none"
                 :colors="['#555', '#555', '#555']"
                 v-bind:value="exercises[index] | rating"
                 >
              </el-rate-->

            </div>
            <div class="card-section">
              <span>{{ exercise.date | date }}</span>
              <dyn-popover style="display: inline-block;" v-if="exercise.note && exercise.note != ' '" :index="index" :content="exercise.note"></dyn-popover>
              <span style="float: right;"><i class="el-icon-delete" @click.prevent="deleteConfirm(index)"></i></span>
            </div>
          </div>
      </el-col>
    </el-row>
    <el-dialog     
       title="Poista treeni?"
       :visible.sync="deleteConfirmVisible">
          <el-button @click.native="deleteConfirmVisible = false" round>Ei</el-button>
          <el-button type="primary" :loading="loading" round @click.prevent="deleteExercise()">Kyllä</el-button>
    </el-dialog>


  </div>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
import DynPopover from './DynPopover.vue'

Vue.use(axios)
export default {
  props: ['activeName', 'updated'],
  data () {
    return {
      exercises: [
      ],
      filteredExercises: [
      ],
      type: 'Kaikki',
      loaded: false,
      loading: false,
      deleteConfirmVisible: false,
      currentIndex: 0,
      exercisesLoading: true
    }
  },
  components: {
    DynPopover
  },
  methods: {
    getExercises: function () {
      this.exercisesLoading = true
      axios.get('/data')
        .then(response => {
          this.exercises = response.data.exercises
          this.filteredExercises = this.exercises
          this.exercisesLoading = false
        })
    },
    deleteConfirm: function (index) {
      this.deleteConfirmVisible = true
      this.currentIndex = index
    },
    deleteExercise: function () {
      this.loading = true
      axios.post('/data/delete', {
        amount: this.exercises[this.currentIndex].amount,
        date: this.exercises[this.currentIndex].date,
        exercisename: this.exercises[this.currentIndex].exercisename
      }).then(reponse => {
        this.loading = false
        this.deleteConfirmVisible = false
        this.exercises.splice(this.currentIndex, 1)
        this.$notify({
          title: 'Success',
          message: 'Treeni poistettu',
          type: 'success'
        })
      }).catch(err => {
        console.log(err)
        this.loading = false
        this.$notify({
          title: 'Virhe',
          message: 'Treenin poistaminen ei onnistunut',
          type: 'error'
        })
      })
    }
  },
  filters: {
    rating: function (value) {
      var rating = 2
      /*
      switch (true) {
        case (value.amount === 1):
          rating = 1
          break
        case (value.amount >= 16):
          rating = 5
          break
        case (value.amount >= 8):
          rating = 4
          break
        case (value.amount >= 4):
          rating = 3
          break
        case (value.amount >= 2):
          rating = 2
          break
      }
      */
      switch (value.modifier) {
        case 'Kevyt':
          rating--
          break
        case 'Rankka':
          rating++
          break
      }
      if (rating < 1) rating = 1
      if (rating > 5) rating = 5
      return rating
    },
    date: function (value) {
      return moment(String(value)).format('DD.MM.YYYY')
    },
    time: function (value) {
      var minutes = value % 4
      var hours = (value - minutes) / 4
      hours = (hours > 0) ? hours + 't ' : ''
      minutes = (minutes > 0) ? minutes * 15 + 'min' : ''
      return hours + minutes
    }
  },
  watch: {
    activeName: function () {
      if (this.activeName === 'second' && this.loaded === false) {
        this.getExercises()
        this.loaded = true
      }
    },
    updated: function () {
      if (this.updated === true) {
        this.loaded = false
        this.$emit('update')
      }
    },
    type: function () {
      let currentType = this.type
      if (this.type === 'Kaikki') {
        this.filteredExercises = this.exercises
      } else {
        this.filteredExercises = this.exercises.filter(function (ex) { return (currentType === ex.exercisename) })
      }
    }
  }
}
</script>
<style scoped="true">
.Lihaskunto {
  background-color: #ff4949; 
  color: #fff;
}
.Lihaskunto .el-radio__input.is-checked + .el-radio__label {
  color: #fff;
}
.Ketteryys {
  background-color: #20a0ff; 
  color: #fff;
}
.Ketteryys .el-radio__input.is-checked + .el-radio__label {
  color: #fff;
}
.Kestävyys {
  background-color: #13ce66; 
  color: #fff;
}
.Kestävyys .el-radio__input.is-checked + .el-radio__label {
  color: #fff;
}
.Kehonhuolto {
  background-color: #ffd801; 
  color: #000;
}
.Kehonhuolto .el-radio__input.is-checked + .el-radio__label {
  color: #000;
}
.card {
  border-radius: 5px;
}
.none {
  display: none;
}
.el-icon-circle-check-m:before{
  /*content: "\1F4AA";*/
  content: "\1F605";
}
.el-col {
  padding-bottom: 5px;
}
</style>

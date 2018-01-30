<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div style="padding: 5px 20px; text-align: center;">
         <el-radio v-model="type" label="Kaikki">Kaikki</el-radio>
         <el-radio class="Lihaskunto" style="padding: 8px; border-radius: 15px;" v-model="type" label="Lihaskunto">Lihaskunto</el-radio>
         <el-radio class="Ketteryys" style="padding: 8px; border-radius: 15px;" v-model="type" label="Ketteryys">Ketteryys</el-radio>
         <el-radio class="Kestävyys" style="padding: 8px; border-radius: 15px;" v-model="type" label="Kestävyys">Kestävyys</el-radio>
         <el-radio class="Kehonhuolto" style="padding: 8px; border-radius: 15px;" v-model="type" label="Kehonhuolto">Kehonhuolto</el-radio>
        </div>
        <hr>
      </el-col>
      <el-col :span="24">
        <div class="columns medium-3" v-for="(exercise, index) in exercises">
          <div class="card" v-show="type == exercise.exercisename || type == 'Kaikki'">
            <div class="card-divider" v-bind:class="exercise.exercisename">
              {{ exercise.exercisetype }} 
              <el-rate
                 style="display: inline-block; float: right;"
                 disabled
                 v-bind:value="exercises[index].amount | rating"
                 >
              </el-rate>

            </div>
            <div class="card-section">
              <span>{{ exercise.date | date }}</span>
              <dyn-popover style="display: inline-block; float: right;" v-if="exercise.note && exercise.note != ' '" :index="index" :content="exercise.note"></dyn-popover>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
import DynPopover from './DynPopover.vue'

Vue.use(axios)
export default {
  data () {
    return {
      exercises: [
      ],
      type: 'Kaikki'
    }
  },
  components: {
    DynPopover
  },
  methods: {
    getExercises: function () {
      axios.get('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/data')
        .then(response => { this.exercises = response.data.exercises })
    }
  },
  filters: {
    rating: function (value) {
      switch (true) {
        case (value === 1):
          return 1
        case (value >= 16):
          return 5
        case (value >= 8):
          return 4
        case (value >= 4):
          return 3
        case (value >= 2):
          return 2
      }
    },
    date: function (value) {
      return moment(String(value)).format('DD.MM.YYYY HH:mm')
    }
  },
  created () {
    this.getExercises()
  }

}
</script>
<style>
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
</style>

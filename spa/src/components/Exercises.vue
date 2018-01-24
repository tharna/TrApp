<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div style="padding: 5px 20px; text-align: center;">
         <el-radio v-model="type" label="Kaikki">Kaikki</el-radio>
         <el-radio v-model="type" label="Lihaskunto">Lihaskunto</el-radio>
         <el-radio v-model="type" label="Ketteryys">Ketteryys</el-radio>
         <el-radio v-model="type" label="Kestävyys">Kestävyys</el-radio>
         <el-radio v-model="type" label="Kehonhuolto">Kehonhuolto</el-radio>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="columns medium-3" v-for="exercise in exercises">
          <div class="card" v-show="type == exercise.exercisename || type == 'Kaikki'">
            <div class="card-divider">
              {{ exercise.exercisename }}
            </div>
            <div class="card-section">
              <p>{{ exercise.exercisetype }}: {{ exercise.amount }}</p>
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
Vue.use(axios)
export default {
  data () {
    return {
      exercises: [
      ],
      type: 'Kaikki'
    }
  },
  methods: {
    getExercises: function () {
      axios.get('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/data')
        .then(response => { this.exercises = response.data.exercises })
    }
  },
  created () {
    this.getExercises()
  }

}
</script>

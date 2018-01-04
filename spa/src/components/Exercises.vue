<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="columns medium-3" v-for="exercise in exercises">
          <div class="card">
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
    <el-row>
      <el-col :span="24">
        <hr>
        <div style="text-align: center;"><el-button type="primary" @click="getExercises" round>Hae treenidata</el-button></div>
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
      ]
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

<template>
  <div>
    <el-row v-for="achievement in achievements"  :key="achievement.name">
      <el-col :span="4">
        <div style="text-align: center;">
          <el-progress type="circle" :percentage="achievement.progress" :status="achievement.status" :width="55"></el-progress>
        </div>
      </el-col>
      <el-col :span="20">
        <div><h4>{{ achievement.name }}</h4>{{ achievement.goal }}</div>
        <hr>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  data () {
    return {
      achievements: [
        { name: 'Juoksija', goal: 'Juokse yhteensä 100km', progress: 25, status: '' },
        { name: 'Kiipijä', goal: 'Nouse yhteensä 1000 rappusta', progress: 40, status: '' },
        { name: 'Vesipeto', goal: 'Ui yhteensä 10km', progress: 100, status: 'success' },
        { name: 'Punnertaja', goal: 'Tee 100 punnerrusta kerralla', progress: 0, status: 'exception' }
      ]
    }
  }
}
</script>
 

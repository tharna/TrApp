<template>
  <form>
    Syötä uusi treeni
    <div id="ConditionalSelect">
      <div class="select">
        <select v-model="category" name="category" @change="sync">
          <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
        </select>
      </div>

      <div>
        <div class="select">
          <select v-model="subcategory" name="subcategory" @change="sync">
            <option v-for="subcategory in conditionalSubcategories" :value="subcategory.id" :selected="subcategory.selected == true">{{ subcategory.name }}</option>
          </select>
        <el-input v-model="other" v-if="subcategory >= 100" placeholder="Laji"></el-input>
        </div>
        <el-input-number v-model="amount" :min="1" :step="1" @change="sync"></el-input-number> <el-tooltip content="1 piste = n. 15 minuttia liikuntaa">
          <i class="el-icon-question"></i>
        </el-tooltip>
        <br>
        Treenin rankkuus: <el-tooltip content="Kuinka raskaaksi koit treenin oman arviosi mukaan.">
          <i class="el-icon-question"></i>
        </el-tooltip><br>
        <el-radio v-model="modifier" label="Kevyt">Kevyt</el-radio>
        <el-radio v-model="modifier" label="Normaali">Normaali</el-radio>
        <el-radio v-model="modifier" label="Rankka">Rankka</el-radio>
      </div>
            <el-date-picker
                                              v-model="date"
                                              format="d.M.yyyy"
                                              :picker-options="datePickerOpts"
                                              placeholder="Treenipäivä">
            </el-date-picker>
    </div>
    Muistiinpanot
    <el-input v-model="note" placeholder="Muistiinpanot" type="textarea"></el-input>
    <div style="text-align:center;"><el-button type="primary" :loading="loading" round @click.prevent="postExerciseData">Lähetä</el-button></div>
  </form>
</template>
<script>
import axios from 'axios'
export default {
  props: ['categories', 'subcategories'],

  data () {
    return {
      category: 0,
      amount: '',
      note: ' ',
      subcategory: 0,
      date: '',
      loading: false,
      other: '',
      modifier: 'Normaali',
      datePickerOpts: {
        firstDayOfWeek: 1,
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  methods: {
    sync: function () {
      this.$emit('input', { amount: this.amount, laji: this.category, type: this.subcategory })
    },
    postExerciseData: function () {
      this.loading = true
      var type = (this.subcategory >= 100 && this.other !== '') ? this.other : this.subcategories.find(category => { return category.id === this.subcategory }).name
      axios.post('/data', {
        exercisename: this.categories.find(category => { return category.id === this.category }).name,
        exercisetype: type,
        amount: parseInt(this.amount),
        note: this.note,
        modifier: this.modifier,
        date: (this.date === '') ? new Date() : this.date
      }).then(reponse => {
        Object.assign(this.$data, this.$options.data())
        this.$notify({
          title: 'Success',
          message: 'Treeni lisätty',
          type: 'success'
        })
        this.$emit('update')
      }).catch(err => {
        console.log(err)
        this.loading = false
        this.$notify({
          title: 'Virhe',
          message: 'Treenin lisääminen ei onnistunut',
          type: 'error'
        })
      })
    }
  },
  computed: {
    conditionalSubcategories () {
      return this.subcategories.filter(subcategory => {
        return subcategory.category_id === this.category
      })
    }
  },

  created () {
    let category = this.categories.find(category => {
      return category.selected === true
    })

    this.category = category.id
  }
}
</script>

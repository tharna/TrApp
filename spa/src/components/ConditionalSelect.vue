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
        </div>
        <el-input-number v-model="amount" :min="1" :step="1" @change="sync"></el-input-number>
        </p>
      </div>
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
      loading: false
    }
  },
  methods: {
    sync: function () {
      this.$emit('input', { amount: this.amount, laji: this.category, type: this.subcategory })
    },
    postExerciseData: function () {
      this.loading = true
      axios.post('https://7u4yroqy10.execute-api.eu-west-1.amazonaws.com/dev/data', {
        exercisename: this.categories.find(category => { return category.id === this.category }).name,
        exercisetype: this.subcategories.find(category => { return category.id === this.subcategory }).name,
        amount: parseInt(this.amount),
        note: this.note
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

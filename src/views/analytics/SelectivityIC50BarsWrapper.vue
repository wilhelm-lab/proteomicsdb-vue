<template>
  <IC50Bars
    ref="IC50Bars"
    :data="selectedDrug"
    :selected-protein="selectedProtein"
    :active-protein="activeProtein"
    :title="title"
    :height="height"
    :bar-width="barWidth"
    @select-protein="onSelectActiveProtein"
    @protein-label-click="onProteinLabelClick"
  />
</template>

<script>
import IC50Bars from './IC50Bars'

export default {
  name: 'SelectivityIC50BarsWrapper',
  components: {
    IC50Bars
  },
  props: {
    height: {
      type: Number,
      default: 200
    },
    barWidth: {
      type: Number,
      default: 10
    },
    selectedProtein: {
      type: Object,
      default: () => {}
    },
    selectedDrug: {
      type: Object,
      default: () => {}
    },
    activeProtein: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    /** @returns {string} */
    title: function () {
      return `pEC50 values of target proteins for ${this.selectedDrug.TREATMENT}`
    }
  },
  methods: {
    onSelectActiveProtein: function (e) {
      this.$emit('select-protein', e)
    },
    onProteinLabelClick ({ proteinId }) {
      this.$router.push({ name: 'protein', params: { proteinId } })
    },
    getSVG: function () {
      return this.$refs.IC50Bars.getSVG()
    }
  }
}
</script>

<style scoped>
</style>

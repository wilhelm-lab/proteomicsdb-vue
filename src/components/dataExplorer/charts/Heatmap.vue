<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series.length > 0"
      type="heatmap"
      height="400"
      :options="chartOptions"
      :series="series"
    />
    <v-container
      v-else
      class="d-flex justify-center"
    >
      <v-progress-circular
        :size="300"
        color="primary"
        indeterminate
      />
    </v-container>
  </div>
</template>

<script>
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)

export default {
  name: 'Heatmap',
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    },
    loading: Boolean,
    xAxisLabel: {
      type: String,
      default () {
        return ''
      }
    },
    yAxisLabel: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      series: [],
      chartOptions: {
        chart: {
          height: 350,
          type: 'heatmap'
        },
        title: {
          text: 'HeatMap Chart (Single color)'
        }
      }
    }
  },
  watch: {
    data: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.series = newVal
      }
    }
  },
  mounted () {
    console.log('data heatmap', this.data)
    this.series = this.data
  }
}
</script>

<style scoped>
</style>

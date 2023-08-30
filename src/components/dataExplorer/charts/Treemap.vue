<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series[0].data.length > 0"
      type="treemap"
      height="360"
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
  name: 'Treemap',
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    },
    loading: {
      type: Boolean
    },
    legend: {
      type: String,
      default () {
        return ''
      }
    },
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
      series: [
        {
          data: []
        }
      ],
      chartOptions: {
        legend: {
          show: false
        },
        chart: {
          height: 350,
          type: 'treemap'
        },
        title: {
          text: 'Treemap'
        },
        xaxis: {
          title: {
            text: this.xAxisLabel
          }
        },
        yaxis: {
          title: {
            text: this.yAxisLabel
          }
        }
      }
    }
  },
  watch: {
    data: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.series[0].data = newVal
      }
    },
    legend: function (newVal, oldVal) {
      if (newVal === oldVal) return
      this.chartOptions = {
        ...this.chartOptions,
        ...{
          legend: {
            show: newVal === 'show',
            showForSingleSeries: newVal === 'show'
          }
        }
      }
    }
  },
  mounted () {
    console.log('data treemap', this.data)
    this.series[0].data = this.data
    this.chartOptions = {
      ...this.chartOptions,
      ...{
        legend: {
          show: this.legend === 'show',
          showForSingleSeries: this.legend === 'show'
        }
      }
    }
  }
}
</script>

<style scoped>
</style>

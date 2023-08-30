<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series.length > 0"
      type="polarArea"
      height="350"
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
  name: 'PolarareaChart',
  props: {
    xAxisData: {
      type: Array,
      default () {
        return []
      }
    },
    yAxisData: {
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
      series: [],
      chartOptions: {
        chart: {
          type: 'polarArea'
        },
        stroke: {
          colors: ['#fff']
        },
        fill: {
          opacity: 0.8
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ],
        labels: [],
        xaxis: {
          categories: [],
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
    xAxisData: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.chartOptions = {
          ...this.chartOptions,
          ...{
            labels: newVal.map(String)
          }
        }
      }
    },
    yAxisData: function (newVal, oldVal) {
      if (oldVal !== newVal) this.series = newVal
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
    this.chartOptions = {
      ...this.chartOptions,
      ...{
        labels: this.xAxisData.map(String),
        legend: {
          show: this.legend === 'show',
          showForSingleSeries: this.legend === 'show'
        }
      }
    }
    this.series = this.yAxisData
  }
}
</script>

<style scoped>
</style>

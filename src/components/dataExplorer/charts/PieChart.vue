<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series.length > 0"
      type="pie"
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
  name: 'PieChart',
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
          width: 380,
          type: 'pie'
        },
        labels: [],
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
      if (oldVal !== newVal) this.series = newVal
    },
    yAxisData: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.chartOptions = {
          ...this.chartOptions,
          ...{
            labels: {
              categories: newVal.map((entry) => entry.toString())
            }
          }
        }
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
    this.series = this.xAxisData
    this.chartOptions = {
      ...this.chartOptions,
      ...{
        xaxis: {
          categories: this.yAxisData
        },
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

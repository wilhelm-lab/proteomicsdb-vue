<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series.length > 0"
      type="bubble"
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
  name: 'BubbleChart',
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    },
    loading: Boolean,
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
    },
    z1AxisLabel: {
      type: String,
      default () {
        return ''
      }
    },
    z2AxisLabel: {
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
          type: 'bubble'
        },
        dataLabels: {
          enabled: false
        },
        fill: {
          type: 'gradient'
        },
        title: {
          text: '3D Bubble Chart'
        },
        xaxis: {
          tickAmount: 15,
          labels: {
            rotate: 0,
            formatter: val => val.toFixed(2)
          },
          title: {
            text: this.xAxisLabel
          }
        },
        yaxis: {
          title: {
            text: this.yAxisLabel
          }
        },
        theme: {
          palette: 'palette2'
        },
        tooltip: {
          z: {
            title: this.z2AxisLabel
          }
        }
      }
    }
  },
  watch: {
    data: function (newVal, oldVal) {
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
    this.series = this.data
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

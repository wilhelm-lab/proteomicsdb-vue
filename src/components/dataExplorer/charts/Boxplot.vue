<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series[0].data.length > 0"
      type="boxPlot"
      height="360"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)

Vue.component('apexchart', VueApexCharts)

export default {
  name: 'Boxplot',
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
    }
  },
  data () {
    return {
      series: [
        {
          name: this.yAxisLabel,
          type: 'boxPlot',
          data: []
        }
        // if you want outliers...
        /* {
          name: "outliers",
          type: "scatter",
          data: [
            {
              x: new Date("2017-01-01").getTime(),
              y: 32,
            },
            {
              x: new Date("2018-01-01").getTime(),
              y: 25,
            },
            {
              x: new Date("2019-01-01").getTime(),
              y: 64,
            },
            {
              x: new Date("2020-01-01").getTime(),
              y: 27,
            },
            {
              x: new Date("2020-01-01").getTime(),
              y: 78,
            },
            {
              x: new Date("2021-01-01").getTime(),
              y: 15,
            },
          ],
        }, */
      ],
      chartOptions: {
        chart: {
          type: 'boxPlot',
          height: 350
        },
        colors: ['#008FFB', '#FEB019'],
        title: {
          text: 'BoxPlot - Scatter',
          align: 'left'
        },
        xaxis: {
          title: {
            text: this.xAxisLabel
          }
        },
        tooltip: {
          shared: false,
          intersect: true
        }
      }
    }
  },
  watch: {
    data: function (newVal, oldVal) {
      if (oldVal !== newVal) this.series[0].data = newVal
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

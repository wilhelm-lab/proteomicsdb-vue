<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series[0].data.length > 0"
      type="scatter"
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
  name: 'ScatterPlot',
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
    colors: {
      type: Array,
      default () {
        return []
      }
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
          name: 'Dimension',
          data: []
        }
      ],
      chartOptions: {
        chart: {
          height: 350,
          type: 'scatter',
          zoom: {
            enabled: true,
            type: 'xy'
          }
        },
        xaxis: {
          tickAmount: 10,
          labels: {
            formatter: function (val) {
              return parseFloat(val).toFixed(1)
            }
          },
          title: {
            text: this.xAxisLabel
          }
        },
        yaxis: {
          tickAmount: 7,
          title: {
            text: this.yAxisLabel
          }
        },
        legend: {
          show: this.legend === 'show',
          showForSingleSeries: this.legend === 'show',
          markers: {
            fillColors: this.colors
          }
        }
      }
    }
  },
  watch: {
    data: function (newVal, oldVal) {
      if (oldVal !== newVal) this.series[0].data = newVal
    },
    colors: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.chartOptions = {
          ...this.chartOptions,
          ...{
            fill: {
              opacity: 1,
              colors: newVal
            },
            legend: {
              show: this.legend === 'show',
              showForSingleSeries: this.legend === 'show',
              markers: {
                fillColors: [newVal]
              }
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
            showForSingleSeries: newVal === 'show',
            markers: {
              fillColors: this.colors
            }
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
        fill: {
          opacity: 1,
          colors: this.colors
        },
        xaxis: {
          categories: this.yAxisData
        },
        legend: {
          show: this.legend === 'show',
          showForSingleSeries: this.legend === 'show',
          markers: {
            fillColors: this.colors
          }
        }
      }
    }
  }
}
</script>

<style scoped>
</style>

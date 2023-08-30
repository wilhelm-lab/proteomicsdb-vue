<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series[0].data.length > 0"
      type="bar"
      height="500"
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
  name: 'BarChart',
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
          name: this.yAxisLabel,
          data: []
        }
      ],
      chartOptions: {
        chart: {
          type: 'bar'
        },
        plotOptions: {
          bar: {
            borderRadius: 10,
            horizontal: true,
            dataLabels: {
              position: 'top' // top, center, bottom
            }
          }
        },
        dataLabels: {
          enabled: false,
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#304758']
          }
        },

        xaxis: {
          categories: [],
          position: 'bottom',
          tooltip: {
            enabled: true
          },
          title: {
            text: this.xAxisLabel
          }
        }
      }
    }
  },
  watch: {
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
    yAxisData: function (newVal, oldVal) {
      if (oldVal !== newVal) this.series[0].data = newVal
    },
    xAxisData: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.chartOptions = {
          ...this.chartOptions,
          ...{
            xaxis: {
              categories: this.xAxisData
            },
            fill: {
              opacity: 1,
              colors: this.colors
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
    this.series[0].data = this.yAxisData
    this.chartOptions = {
      ...this.chartOptions,
      ...{
        xaxis: {
          categories: this.xAxisData
        },
        legend: {
          show: this.legend === 'show',
          showForSingleSeries: this.legend === 'show',
          markers: {
            fillColors: this.colors
          }
        },
        fill: {
          opacity: 1,
          colors: this.colors
        }
      }
    }
  }
}
</script>

<style scoped>
</style>

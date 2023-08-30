<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series[0].data.length > 0"
      type="bar"
      height="300"
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
  name: 'ColumnChart',
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
    opacity: {
      type: Number,
      default () {
        return 1
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
          data: this.yAxisData
        }
      ],
      chartOptions: {
        chart: {
          height: 360,
          type: 'bar'
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          title: {
            text: this.xAxisLabel
          },
          categories: this.xAxisData
        },
        yaxis: {
          title: {
            text: this.yAxisLabel
          }
        },
        fill: {
          opacity: this.opacity,
          colors: this.colors
        },
        legend: {
          show: false,
          showForSingleSeries: false
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
          categories: this.xAxisData,
          title: {
            text: this.xAxisLabel
          }
        },
        yaxis: {
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

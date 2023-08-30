<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series.length > 0"
      type="radar"
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
  name: 'RadarChart',
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
    },
    z1AxisLabel: {
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
          type: 'radar',
          dropShadow: {
            enabled: true,
            blur: 1,
            left: 1,
            top: 1
          }
        },
        title: {
          text: 'Radar Chart - Multi Series'
        },
        stroke: {
          width: 2
        },
        fill: {
          opacity: 0.1
        },
        markers: {
          size: 0
        },
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
    yAxisData: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.series = newVal.map((entry) => ({
          name: entry.name.toString(),
          ...entry
        }))
      }
    },
    xAxisData: function (newVal, oldVal) {
      if (oldVal !== newVal) { this.chartOptions.xaxis.categories = newVal.map(String) }
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
    this.series = this.yAxisData.map((entry) => ({
      name: entry.name.toString(),
      ...entry
    }))
    this.chartOptions = {
      ...this.chartOptions,
      ...{
        xaxis: {
          categories: this.xAxisData.map(String)
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

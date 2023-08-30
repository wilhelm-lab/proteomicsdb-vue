<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series[0].data.length > 0"
      type="line"
      height="480"
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
  name: 'GradientChart',
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
          name: 'Dimension',
          data: []
        }
      ],
      chartOptions: {
        chart: {
          height: 350,
          type: 'line'
        },
        stroke: {
          width: 4,
          curve: 'smooth'
        },
        xaxis: {
          categories: [],
          title: {
            text: this.xAxisLabel
          }
        },
        /* title: {
          text: "Protein Q Value to Count",
          align: "left",
          style: {
            fontSize: "16px",
            color: "#666",
          },
        }, */
        yaxis: {
          title: {
            text: this.yAxisLabel
          }
        },
        colors: this.colors,
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
            colors: newVal,
            legend: {
              show: this.legend === 'show',
              showForSingleSeries: this.legend === 'show',
              markers: {
                fillColors: newVal
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
    console.log('mounted color', this.colors)
    this.series[0].data = this.yAxisData
    this.chartOptions = {
      ...this.chartOptions,
      ...{
        xaxis: {
          categories: this.xAxisData
        },
        colors: this.colors,
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
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

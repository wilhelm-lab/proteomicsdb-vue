<template>
  <div id="chart">
    <apexchart
      v-if="!loading && series[0].data.length > 0"
      type="area"
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
  name: 'AreaChart',
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
          height: 350,
          type: 'line'
        },
        stroke: {
          width: 7,
          curve: 'smooth'
        },
        xaxis: {
          labels: {
            formatter: function (value) {
              return `>=${value}`
            }
          },
          categories: []
        },
        title: {
          // text: "Protein Q Value to Count",
          align: 'left',
          style: {
            fontSize: '16px',
            color: '#666'
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            gradientToColors: this.colors,
            shadeIntensity: 1,
            type: 'horizontal',
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100, 100, 100]
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
    colors: function (newVal, oldVal) {
      if (oldVal !== newVal) {
        this.chartOptions = {
          ...this.chartOptions,
          ...{
            fill: {
              type: 'gradient',
              gradient: {
                shade: 'dark',
                gradientToColors: newVal,
                shadeIntensity: 1,
                type: 'horizontal',
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100, 100, 100]
              }
            },
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
              categories: newVal,
              labels: {
                formatter: function (value) {
                  if (typeof value === 'number') return `${value.toFixed(6)}`
                  return `${value}`
                }
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
          fill: {
            type: 'gradient',
            gradient: {
              shade: 'dark',
              gradientToColors: this.colors,
              shadeIntensity: 1,
              type: 'horizontal',
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100, 100, 100]
            }
          },
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
    this.chartOptions = {
      ...this.chartOptions,
      ...{
        xaxis: {
          categories: this.xAxisData,
          labels: {
            formatter: function (value) {
              if (typeof value === 'number') return `${value.toFixed(6)}`
              return `${value}`
            }
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
    this.series[0].data = this.yAxisData
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

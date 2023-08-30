<template>
  <v-row no-gutters>
    <template v-for="(chartType, index) in chartTypes">
      <v-col
        :key="index"
        :class="!isInForm && formValues.submitted ? 'relative-important' : ''"
      >
        <v-hover v-slot="{ hover }">
          <v-card
            :disabled="
              (!isInForm && !formValues.submitted) ||
                (!isInForm &&
                  formValues.submitted &&
                  chartType.disabledForList.some(
                    (chartName) => chartName === formValues.selectedChart
                  ))
            "
            class="ma-2"
            :class="{
              active: chartType.isClicked,
              'on-hover': hover,
            }"
            :elevation="hover ? 6 : 2"
            outline
            tile
            @click.stop="selectChart(index)"
          >
            <v-card-title
              class="m-0 card-main"
              :class="!isInForm && 'pl-4 card-title-tiny-padding'"
            >
              <img
                :src="chartType.src"
                :height="isInForm ? '28' : '20'"
                :width="isInForm ? '28' : '20'"
                class="mr-1"
                contain
              >
              <p
                class="mb-0"
                :class="getFontSizeClass()"
              >
                {{ chartType.name }}
              </p>
              <v-icon
                v-if="selectedChart === chartType.name"
                :x-small="!isInForm && true"
                :dense="isInForm && true"
                color="green darken-2"
                class="icon-main"
              >
                mdi-check-circle
              </v-icon>
            </v-card-title>
          </v-card>
        </v-hover>
        <div
          v-if="
            !isInForm &&
              formValues.submitted &&
              chartType.disabledForList.some(chartName => chartName === formValues.selectedChart)
          "
          class="icon-secondary"
        >
          <tooltip-icon-info
            class-icon=""
            :tooltip-text="generateTooltipText(chartType.name)"
            color="red"
          />
        </div>
      </v-col>
      <v-responsive
        v-if="index % 3 === 2"
        :key="`width-${index}`"
        width="100%"
      />
    </template>
  </v-row>
</template>

<script>
import TooltipIconInfo from './TooltipIconInfo.vue'
export default {
  name: 'ChartCardOptions',
  components: { TooltipIconInfo },
  props: {
    formValues: {
      type: Object,
      default () {
        return {
          selectedChart: 0,
          submitted: false
        }
      }
    },
    isInForm: Boolean
  },
  data () {
    return {
      chartTypes: [
        {
          src: require('@/assets/charts/column-chart.png'),
          name: 'Column',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/line-chart.png'),
          name: 'Gradient',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/spline-chart.png'),
          name: 'Area',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/pie-chart.png'),
          name: 'Pie',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/bar-chart.png'),
          name: 'Bar',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/scatter-plot.png'),
          name: 'Scatter',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/bubble-chart.png'),
          name: 'Bubble',
          isClicked: false,
          disabledForList: [
            'Column',
            'Gradient',
            'Area',
            'Pie',
            'Bar',
            'Scatter',
            'Heatmap',
            'Boxplot',
            'Radar',
            'Polararea',
            'Treemap'
          ]
        },
        {
          src: require('@/assets/charts/heatmap.png'),
          name: 'Heatmap',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/box-plot.png'),
          name: 'Boxplot',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/radar-chart.png'),
          name: 'Radar',
          isClicked: false,
          disabledForList: [
            'Column',
            'Gradient',
            'Area',
            'Pie',
            'Bar',
            'Scatter',
            'Heatmap',
            'Boxplot',
            'Polararea',
            'Treemap',
            'Bubble'
          ]
        },
        {
          src: require('@/assets/charts/polararea-chart.png'),
          name: 'Polararea',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        },
        {
          src: require('@/assets/charts/treemap-chart.png'),
          name: 'Treemap',
          isClicked: false,
          disabledForList: ['Radar', 'Bubble']
        }
      ],
      selectedChart: this.formValues.selectedChart
    }
  },
  methods: {
    selectChart (chartTypeIndex) {
      this.chartTypes = this.chartTypes.map((entry) => ({
        ...entry,
        isClicked: false
      }))
      this.chartTypes[chartTypeIndex].isClicked = true
      this.formValues.selectedChart = this.chartTypes[chartTypeIndex].name
      // we need this because we want to isolate the two duplicate components
      this.selectedChart = this.chartTypes[chartTypeIndex].name
      if (this.isInForm) {
        this.formValues.submitted = false
      } else {
        this.$store.dispatch('dataExplorer/processResults', {
          results: this.$store.state.dataExplorer.results
        })
        this.$store.commit('dataExplorer/setLoading', false)
      }
    },
    getFontSizeClass () {
      return {
        'ml-4 font-small': this.isInForm,
        'font-extra-small': !this.isInForm
      }
    },
    generateTooltipText (chartTypeName) {
      if (chartTypeName === 'Bubble') {
        return 'You cannot switch to this chart<br>as it needs 4 axis values.'
      } else if (chartTypeName === 'Radar') {
        return 'You cannot switch to this chart<br>as it needs 3 axis values.'
      } else {
        return 'This chart needs 2 axis values<br>and you have provided more.'
      }
    }
  }
}
</script>

<style scoped>
.font-extra-small {
  font-size: 9px;
}

.card-title-tiny-padding {
  padding: 1px !important;
}

.icon-main {
  position: absolute !important;
  right: 5%;
}

.icon-secondary {
  position: absolute !important;
  right: 10%;
  top: 30%;
}

.relative-important {
  position: relative !important
}

.card-main {
  position: relative !important;
}

.pointer {
  cursor: pointer;
}
</style>

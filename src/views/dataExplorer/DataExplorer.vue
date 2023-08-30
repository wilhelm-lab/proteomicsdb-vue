<template>
  <v-main>
    <v-container
      fluid
      ml-5
      class="main-container"
    >
      <div class="stepper-section">
        <v-container>
          <h1>Flexible Analytics</h1>
        </v-container>
        <ChartForm
          :form-values="formValues"
          :dialog="dialog"
          @close-dialog="dialog = $event"
          @generate-chart="generateChart"
          @process-results="processResults"
          @update-axis="updateAxis"
          @update-ztransformations="updateZTransformations"
          @update-zaggregations="updateZAggregations"
          @update-submit="updateSubmit"
        />
      </div>
      <div class="chart-group mr-2">
        <div v-if="formValues.submitted">
          <div v-if="formValues.selectedChart === 'Column'">
            <ColumnChart
              :x-axis-data="xAxisData"
              :y-axis-data="yAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :colors="colorsFromStore"
              :opacity="1"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Gradient'">
            <GradientChart
              :x-axis-data="xAxisData"
              :y-axis-data="yAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :colors="colorsFromStore"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Area'">
            <AreaChart
              :x-axis-data="xAxisData"
              :y-axis-data="yAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :colors="colorsFromStore"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Scatter'">
            <ScatterPlot
              :data="xAxisData"
              :loading="loading"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :colors="colorsFromStore"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Bar'">
            <BarChart
              :x-axis-data="xAxisData"
              :y-axis-data="yAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :colors="colorsFromStore"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Pie'">
            <PieChart
              :x-axis-data="xAxisData"
              :y-axis-data="yAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Radar'">
            <RadarChart
              :x-axis-data="xAxisData"
              :y-axis-data="yAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Polararea'">
            <PolarareaChart
              :x-axis-data="xAxisData"
              :y-axis-data="yAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Boxplot'">
            <Boxplot
              :data="xAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :loading="loading"
              :legend="legendChoice"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Heatmap'">
            <Heatmap
              :loading="loading"
              :data="xAxisData"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Bubble'">
            <BubbleChart
              :data="xAxisData"
              :loading="loading"
              :legend="legendChoice"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
              :z1-axis-label="z1AxisLabel"
              :z2-axis-label="z2AxisLabel"
            />
          </div>
          <div v-else-if="formValues.selectedChart === 'Treemap'">
            <Treemap
              :data="xAxisData"
              :loading="loading"
              :legend="legendChoice"
              :x-axis-label="xAxisLabel"
              :y-axis-label="yAxisLabel"
            />
          </div>
        </div>
        <div
          v-else
          class="default-chart-section"
        >
          <h1 class="measures">
            Measures
          </h1>
          <h1 class="dimensions">
            Dimensions
          </h1>
          <ColumnChart
            :x-axis-data="['M1', 'M2', 'M3', 'M4']"
            :y-axis-data="[5, 10, 3, 8]"
            :loading="false"
            :colors="colorsFromStore"
            :opacity="0.2"
          />
        </div>
        <v-divider />
        <div class="section-title">
          <span class="font-small"><b>SETTINGS</b></span>
        </div>
        <v-container class="d-flex dynamic-filtering-container">
          <v-row>
            <v-col
              v-if="
                formValues.selectedChart !== 'Pie' &&
                  formValues.selectedChart !== 'Bubble' &&
                  formValues.selectedChart !== 'Radar' &&
                  formValues.selectedChart !== 'Polararea' &&
                  formValues.selectedChart !== 'Boxplot' &&
                  formValues.selectedChart !== 'Heatmap' &&
                  formValues.selectedChart !== 'Treemap'
              "
              cols="4"
              class="pr-0"
            >
              <v-card
                outlined
                :class="!formValues.submitted && 'background-disabled'"
              >
                <v-list-item three-line>
                  <v-list-item-content class="py-0">
                    <div
                      class="text-overline d-flex justify-center border-bottom"
                      :class="!formValues.submitted && 'background-disabled'"
                    >
                      Color
                    </div>
                    <v-color-picker
                      v-model="colorPickerColor"
                      hide-canvas
                      width="255"
                      :class="!formValues.submitted && 'background-disabled'"
                      :disabled="!formValues.submitted"
                    />
                  </v-list-item-content>
                </v-list-item>
                <v-card-actions class="d-flex justify-center">
                  <v-btn
                    outlined
                    text
                    :disabled="!formValues.submitted"
                    @click="updateColors"
                  >
                    Update colors
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col
              cols="6"
              class="pr-2"
            >
              <v-card
                outlined
                :class="!formValues.submitted && 'background-disabled'"
              >
                <v-list-item three-line>
                  <v-list-item-content class="py-0">
                    <div
                      class="text-overline d-flex justify-center border-bottom"
                    >
                      Chart Type
                    </div>
                    <chart-card-options
                      :form-values="formValues"
                      :is-in-form="false"
                      :loading="loading"
                    />
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
            <v-col
              v-if="formValues.selectedChart !== 'Heatmap'"
              cols="2"
              class="pl-0"
            >
              <v-card
                class="ml-0"
                outlined
                :class="!formValues.submitted && 'background-disabled'"
              >
                <v-list-item three-line>
                  <v-list-item-content class="py-0">
                    <div
                      class="text-overline d-flex justify-center border-bottom"
                      :class="!formValues.submitted && 'background-disabled'"
                    >
                      Legend
                    </div>
                    <v-radio-group
                      v-model="legendChoice"
                      :disabled="!formValues.submitted"
                      class="small-radio"
                    >
                      <v-radio
                        v-for="(legendOption, index) in legendOptions"
                        :key="index"
                        :label="
                          legendOption.charAt(0).toUpperCase() +
                            legendOption.slice(1)
                        "
                        :value="legendOption"
                      />
                    </v-radio-group>
                  </v-list-item-content>
                </v-list-item>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-container>
  </v-main>
</template>

<script>
import ChartForm from '../../components/dataExplorer/ChartForm.vue'
import ColumnChart from '../../components/dataExplorer/charts/ColumnChart.vue'
import GradientChart from '../../components/dataExplorer/charts/GradientChart.vue'
import AreaChart from '../../components/dataExplorer/charts/AreaChart.vue'
import ScatterPlot from '../../components/dataExplorer/charts/ScatterPlot.vue'
import BarChart from '../../components/dataExplorer/charts/BarChart.vue'
import PieChart from '../../components/dataExplorer/charts/PieChart.vue'
import RadarChart from '../../components/dataExplorer/charts/RadarChart.vue'
import PolarareaChart from '../../components/dataExplorer/charts/PolarareaChart.vue'
import Boxplot from '../../components/dataExplorer/charts/Boxplot.vue'
import Heatmap from '../../components/dataExplorer/charts/Heatmap.vue'
import BubbleChart from '../../components/dataExplorer/charts/BubbleChart.vue'
import Treemap from '../../components/dataExplorer/charts/Treemap.vue'
import ChartCardOptions from '../../components/dataExplorer/elements/ChartCardOptions.vue'
import { mapState } from 'vuex'

export default {
  name: 'DataExplorer',
  components: {
    ColumnChart,
    GradientChart,
    AreaChart,
    ChartForm,
    ChartCardOptions,
    ScatterPlot,
    BarChart,
    PieChart,
    RadarChart,
    PolarareaChart,
    Boxplot,
    Heatmap,
    BubbleChart,
    Treemap
  },
  data () {
    return {
      colorPickerColor: '',
      legendOptions: ['show', 'hide'],
      legendChoice: 'show',
      dialog: false
    }
  },
  computed: {
    ...mapState('dataExplorer', {
      xAxisData: 'xAxisData',
      yAxisData: 'yAxisData',
      zAxis: 'zAxis',
      zTransformations: 'zTransformations',
      zAggregations: 'zAggregations',
      loading: 'loading',
      colorsFromStore: 'colors',
      formValues: 'formValues',
      results: 'results'
    }),
    groupByColumnsFinalized: function () {
      if (this.formValues.groupByAdditional.length === 0) return []
      // We make sure that only selected columns in the dropdown are taken into consideration
      // from ['SEQUENCE', 'DECOY'] checked and for groupByAdditional as ['SEQUENCE', 'SCORE', 'Q_VALUE'] => ['SEQUENCE']
      const filteredMainArr = this.formValues.groupByMain.filter((entryMain) =>
        this.formValues.groupByAdditional.some((entryAdditional) =>
          entryMain.includes(entryAdditional)
        )
      )
      // We filter out all duplicate values whereas first we map everything to pureENTRY
      const filteredAdditionalArr = this.formValues.groupByAdditional
        .map((entry) => `pure${entry}`)
        .filter(
          (entryAdditional) =>
            !filteredMainArr.some((entryMain) =>
              entryAdditional.includes(entryMain)
            )
        )
      const finalGroupByArr = filteredMainArr.concat(filteredAdditionalArr)
      return finalGroupByArr
    },
    xAxisLabel: function () {
      let xAxisLabelFinal = this.formValues.xAxis.Name
      if (this.formValues.xTransformation !== '') xAxisLabelFinal = `${this.formValues.xTransformation}(${this.formValues.xAxis.Name})`
      if (this.formValues.xAggregation !== '') xAxisLabelFinal = `${this.formValues.xAggregation}(${xAxisLabelFinal})`
      return xAxisLabelFinal
    },
    yAxisLabel: function () {
      let yAxisLabelFinal = this.formValues.yAxis.Name
      if (this.formValues.yTransformation !== '') yAxisLabelFinal = `${this.formValues.yTransformation}(${this.formValues.yAxis.Name})`
      if (this.formValues.yAggregation !== '') yAxisLabelFinal = `${this.formValues.yAggregation}(${yAxisLabelFinal})`
      return yAxisLabelFinal
    },
    z1AxisLabel: function () {
      let z1AxisLabelFinal = this.formValues.z1Axis.Name
      if (this.formValues.z1Transformation !== '') z1AxisLabelFinal = `${this.formValues.z1Transformation}(${this.formValues.z1Axis.Name})`
      if (this.formValues.z1Aggregation !== '') z1AxisLabelFinal = `${this.formValues.z1Aggregation}(${z1AxisLabelFinal})`
      return z1AxisLabelFinal
    },
    z2AxisLabel: function () {
      let z2AxisLabelFinal = this.formValues.z2Axis.Name
      if (this.formValues.z2Transformation !== '') z2AxisLabelFinal = `${this.formValues.z2Transformation}(${this.formValues.z2Axis.Name})`
      if (this.formValues.z2Aggregation !== '') z2AxisLabelFinal = `${this.formValues.z2Aggregation}(${z2AxisLabelFinal})`
      return z2AxisLabelFinal
    }
  },
  methods: {
    async generateChart (limitSize) {
      const data = await this.$store.dispatch('dataExplorer/getAnalyticsData', {
        groupByColumnsFinalized: this.groupByColumnsFinalized,
        limitSize
      })

      if (data.size <= 1000) {
        this.$store.dispatch('dataExplorer/processResults', {
          results: data.results
        })
        this.updateSubmit(true)
      } else {
        this.dialog = true
      }
    },
    processResults () {
      this.$store.dispatch('dataExplorer/processResults', {
        results: this.results
      })
      this.updateSubmit(true)
    },
    updateTableName (value) {
      this.formValues.tableName = value
      this.updateSubmit(false)
    },
    updateAxis (axis, value) {
      this.formValues[axis] = value
      // update groupByArray
      switch (axis) {
        case 'xAxis':
          this.formValues.groupByMain[0] = value.Name
          break
        case 'yAxis':
          this.formValues.groupByMain[1] = value.Name
          break
        case 'z1Axis':
          this.zAxis[0] = value
          this.formValues.groupByMain[2] = value.Name
          break
        case 'z2Axis':
          this.zAxis[1] = value
          this.formValues.groupByMain[3] = value.Name
          break
        default:
          this.formValues.groupByMain = []
      }
      this.updateSubmit(false)
    },
    updateZTransformations (transformation, value) {
      switch (transformation) {
        case 'z1Transformation':
          this.zTransformations[0] = value
          break
        case 'z2Transformation':
          this.zTransformations[1] = value
          break
        default:
          this.zTransformations = []
      }
    },
    updateZAggregations (aggregation, value) {
      switch (aggregation) {
        case 'z1Aggregation':
          this.zAggregations[0] = value
          break
        case 'z2Aggregation':
          this.zAggregations[1] = value
          break
        default:
          this.zAggregations = []
      }
    },
    updateSubmit (value) {
      this.formValues.submitted = value
    },
    updateSelectedChart (value) {
      this.formValues.selectedChart = value
      this.updateSubmit(false)
    },
    updateColors () {
      this.$store.commit('dataExplorer/setColors', [this.colorPickerColor])
    }
  }
}
</script>

<style>
.main-container {
  display: flex;
  flex-direction: row;
  max-width: 100%;
}

.stepper-section {
  display: flex;
  flex-direction: column;
  min-width: 45%;
}

.chart-group {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.section-title {
  margin-top: 1em;
  position: relative;
}

.info-icon {
  position: absolute !important;
}

.default-chart-section {
  position: relative;
}

.measures {
  position: absolute;
  color: #888888;
  opacity: 0.2;
  left: 35%;
  text-transform: uppercase;
}

.dimensions {
  position: absolute;
  color: #888888;
  opacity: 0.2;
  top: 35%;
  left: 0%;
  text-transform: uppercase;
  transform: rotate(270deg);
}

.border-bottom {
  border-bottom: 1px solid #ccc;
}

.dynamic-filtering-container > *:not(:last-child) {
  margin-right: 10px !important;
}

.background-disabled {
  opacity: 0.75;
}
</style>

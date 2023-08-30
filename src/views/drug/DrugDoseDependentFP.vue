<template>
  <v-row style="position: relative">
    <loading-overlay :loading="isLoading" />
    <v-col
      cols="12"
    >
      <v-row>
        <v-col
          cols="12"
          class="d-flex pb-0"
        >
          <v-spacer />
          <column-chooser-button
            @toggle-column-chooser="toggleColumnChooser = !toggleColumnChooser"
          />
          <download-speed-dial
            class="ml-3"
            direction="left"
            csv
            svg
            png
            :loading="downloadLoading"
            @csv="getCSV"
            @svg="getSVG"
            @png="getPNG"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <the-drug-ddfp-table
            ref="ddfptable"
            :data-grid-ref-name="dataGridRefName"
            :data-source="drugData"
            :is-loading="isLoading"
            :toggle-column-chooser="toggleColumnChooser"
            class="ddfptable"
            @selected-rows-changed="onSelectedRowsChanged"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          lg="6"
        >
          <v-card
            elevation="0"
            class="overflow-x-auto"
          >
            <v-card-text>
              <v-alert
                v-if="!selectedCurveIDs.length"
                color="blue-grey"
                text
                icon="mdi-arrow-up"
              >
                Select one or more entries above to show their dose-response curves here.
              </v-alert>
              <response-curve
                ref="responseCurve"
                :min-height="650"
                :min-width="600"
                :legend-at-bottom="true"
                :model-ids="selectedCurveIDs"
                :drug-names="drugNameRepeated"
                data-type="ptmCurves"
                :is-full-proteome="true"
                parent-perspective="drug"
                @update-curve-styles="updateCurveStyles"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          lg="6"
        >
          <v-row>
            <v-col
              v-for="item in ec50BackgroundDataFlat"
              :key="item.title"
              cols="12"
            >
              <v-card
                elevation="0"
                class="overflow-x-auto"
              >
                <v-card-text>
                  <ec50-histogram
                    :key="item.title"
                    :ref="'ec50histogram-' + item.cellLine"
                    :min-height="350"
                    :min-width="600"
                    :chart-data="item.data"
                    :cell-line="item.cellLine"
                    :title="item.title"
                    :min-dose="item.minDose"
                    :max-dose="item.maxDose"
                    :dose-unit="item.doseUnit"
                    :selected-lines="(oEC50Curves && oEC50Curves[item.cellLine] && oEC50Curves[item.cellLine]) ?
                      oEC50Curves[item.cellLine] :
                      []"
                    xlabel="log10(EC50)"
                    data-level="Protein"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>

    <canvas
      id="canvasId"
      style="display: none"
    />
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'

import utils from '../../utils/downloadUtils'

import TheDrugDdfpTable from '../../components/partials/drug/drugddfp/TheDrugDdfpTable'

import LoadingOverlay from '@/components/LoadingOverlay.vue'
import ColumnChooserButton from '@/components/ColumnChooserButton'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ResponseCurve from '@/vue-d3-component-wrappers/ResponseCurve'
import Ec50Histogram from '@/vue-d3-component-wrappers/EC50Histogram'

export default {
  components: {
    LoadingOverlay,
    ColumnChooserButton,
    DownloadSpeedDial,
    ResponseCurve,
    TheDrugDdfpTable,
    Ec50Histogram
  },
  data: () => ({
    downloadLoading: false,
    dataGridInstance: null,
    dataGridRefName: 'ddfptable',
    selectedCurveIDs: [],
    oEC50Data: null,
    ec50BackgroundData: null,
    oEC50Curves: null,
    isLoading: false,
    toggleColumnChooser: false,
    currentAxiosCancelTokenSource: null,
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      drugId: 'drug/getDrugId',
      drugName: 'drug/getDrugName',
      drugData: 'drug/cellPerturbation/doseDependentFp/getData'
    }),
    /** @returns {string[]} */
    drugNameRepeated () {
      // The drug name is always the same in the drug centric view - just repeat it to the same length as the curve ids
      return this.selectedCurveIDs.map(() => this.drugName)
    },
    /** @returns {any[]} */
    ec50BackgroundDataFlat () {
      const res = []
      for (const cellLine in this.ec50BackgroundData) {
        res.push({
          cellLine,
          title: `EC50 Distribution of Regulated Proteins @ ${cellLine} (n=${this.ec50BackgroundData[cellLine].values.length})`,
          data: this.ec50BackgroundData[cellLine].values,
          minDose: this.ec50BackgroundData[cellLine].minDose,
          maxDose: this.ec50BackgroundData[cellLine].maxDose,
          doseUnit: this.ec50BackgroundData[cellLine].doseUnit
        })
      }
      return res
    }
  },
  created () {
    this.getEC50BackgroundData()
  },
  methods: {
    saveGridInstance (e) {
      this.dataGridInstance = e.component
    },
    updateCurveStyles (curveStyleMapping) {
      const EC50Results = {}
      for (const cellLine in this.oEC50Data) {
        EC50Results[cellLine] = []
        for (const curveId in this.oEC50Data[cellLine]) {
          if (curveId in curveStyleMapping) {
            // After some headache, it turns out curveStyleMapping, used in GenericHistogram,
            // actually comes from GenericLinePlot.vue
            // Oh god why.
            const EC50Line = Object.assign({}, curveStyleMapping[curveId]) // create copy
            EC50Line.value = -this.oEC50Data[cellLine][curveId]
            EC50Line.curveid = curveId
            EC50Results[cellLine].push(EC50Line)
          }
        }
      }
      this.oEC50Curves = EC50Results
    },
    getEC50BackgroundData () {
      axios.get(this.$store.state.host + '/proteomicsdb/logic/drugcentric/getEC50Data.xsjs', {
        params: { drugName: this.drugName, isFullProteome: true }
      })
        .then((response) => {
          this.ec50BackgroundData = response.data
        })
    },

    getCSV () {
      this.$refs.ddfptable.onExporting(this.drugName)
    },
    getSVG () {
      this.downloadPlots('svg')
    },
    getPNG () {
      this.downloadPlots('png')
    },
    onSelectedRowsChanged (selection) {
      this.selectedCurveIDs = selection.map((s) => s.CURVE_ID)
      this.oEC50Data = {}

      selection.forEach((s) => {
        if (!this.oEC50Data[s.CELLLINE_NAME]) {
          this.oEC50Data[s.CELLLINE_NAME] = {}
        }

        if (!this.oEC50Data[s.CELLLINE_NAME]) {
          this.oEC50Data[s.CELLLINE_NAME] = {}
        }

        this.oEC50Data[s.CELLLINE_NAME][s.CURVE_ID] = s.LOG_IC50
      })
    },
    downloadPlots (type) {
      this.downloadLoading = true
      const aPlots = []
      for (const refKey in this.$refs) {
        if (refKey.includes('responseCurve') || refKey.includes('histogram')) {
          // Vue returns a singleton array if the ref was defined in a for loop.
          let domElement = this.$refs[refKey]
          if (Array.isArray(domElement)) domElement = domElement[0]
          aPlots.push(domElement.getSVG())
        }
      }

      if (aPlots) {
        utils.downloadSVGs(
          aPlots,
          'Dose Response: ' + this.drugName,
          type === 'svg',
          'canvasId',
          this.svgCss
        )
      }
      this.downloadLoading = false
    }
  }

}
</script>

<style lang="scss" scoped>
.ddfptable {
  width: 100%;
}
</style>

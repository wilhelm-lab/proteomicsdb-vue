<template>
  <v-row style="position: relative">
    <loading-overlay :loading="isLoadingAny" />
    <v-col
      cols="12"
    >
      <v-row>
        <v-col
          cols="12"
          class="d-flex pb-0"
        >
          <v-switch
            v-model="aggregateSwitch"
            label="Aggregate by Protein"
            @change="unselectAllRows"
          />
          <v-spacer />
          <column-chooser-button
            v-if="aggregateSwitch"
            @toggle-column-chooser="toggleColumnChooserAggregated = !toggleColumnChooserAggregated"
          />
          <column-chooser-button
            v-else
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
          <the-drug-ddptm-table-protein
            v-show="aggregateSwitch"
            ref="ddptmtableAggregated"
            :data-grid-ref-name="dataGridRefNameAggregated"
            :data-source="drugData.proteinLevelData"
            :is-loading="isLoadingAggregated"
            :toggle-column-chooser="toggleColumnChooserAggregated"
            class="ddptmtable"
            @selected-rows-changed="onSelectedRowsChanged"
          />
          <the-drug-ddptm-table-peptide
            v-show="!aggregateSwitch"
            ref="ddptmtable"
            :data-grid-ref-name="dataGridRefName"
            :data-source="drugData.peptideLevelData"
            :is-loading="isLoading"
            :toggle-column-chooser="toggleColumnChooser"
            class="ddptmtable"
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
                    :ref="'ec50histogram-' + item.cellLine + '-' + item.ptmType"
                    :min-height="350"
                    :min-width="600"
                    :chart-data="item.data"
                    :ptm-type="item.ptmType"
                    :cell-line="item.cellLine"
                    :title="item.title"
                    :min-dose="item.minDose"
                    :max-dose="item.maxDose"
                    :dose-unit="item.doseUnit"
                    :selected-lines="(oEC50Curves && oEC50Curves[item.cellLine] && oEC50Curves[item.cellLine][item.ptmType]) ?
                      oEC50Curves[item.cellLine][item.ptmType] :
                      []"
                    xlabel="log10(EC50)"
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

import TheDrugDdptmTablePeptide from '../../components/partials/drug/drugddptm/TheDrugDdptmTablePeptide'
import TheDrugDdptmTableProtein from '../../components/partials/drug/drugddptm/TheDrugDdptmTableProtein'

import LoadingOverlay from '@/components/LoadingOverlay'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ColumnChooserButton from '@/components/ColumnChooserButton'
import ResponseCurve from '@/vue-d3-component-wrappers/ResponseCurve'
import Ec50Histogram from '@/vue-d3-component-wrappers/EC50Histogram'

export default {
  name: 'DrugSummary',
  components: {
    LoadingOverlay,
    DownloadSpeedDial,
    ColumnChooserButton,
    TheDrugDdptmTablePeptide,
    TheDrugDdptmTableProtein,
    ResponseCurve,
    Ec50Histogram
  },
  data: () => ({
    downloadLoading: false,
    dataGridInstance: null,
    dataGridRefName: 'ddptmDataGrid',
    dataGridRefNameAggregated: 'ddptmDataGridAggregated',
    selectedCurveIDs: [],
    oEC50Data: null,
    ec50BackgroundData: null,
    oEC50Curves: null,
    isLoading: false,
    isLoadingAggregated: false,
    toggleColumnChooser: false,
    toggleColumnChooserAggregated: false,
    currentAxiosCancelTokenSource: null,
    currentAxiosCancelTokenSourceAggregated: null,
    aggregateSwitch: false,
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      drugId: 'drug/getDrugId',
      drugName: 'drug/getDrugName',
      drugData: 'drug/cellPerturbation/doseDependentPtm/getData'
    }),
    /** @returns {string{}} */
    drugNameRepeated () {
      // The drug name is always the same in the drug centric view - just repeat it to the same length as the curve ids
      return this.selectedCurveIDs.map(() => this.drugName)
    },
    /** @returns {any[]}} */
    ec50BackgroundDataFlat () {
      const res = []
      for (const cellLine in this.ec50BackgroundData) {
        for (const ptmType in this.ec50BackgroundData[cellLine]) {
          res.push({
            ptmType,
            cellLine,
            title: `EC50 Distribution of ${ptmType} peptides @ ${cellLine} (n=${this.ec50BackgroundData[cellLine][ptmType].values.length})`,
            data: this.ec50BackgroundData[cellLine][ptmType].values,
            minDose: this.ec50BackgroundData[cellLine][ptmType].minDose,
            maxDose: this.ec50BackgroundData[cellLine][ptmType].maxDose,
            doseUnit: this.ec50BackgroundData[cellLine][ptmType].doseUnit
          })
        }
      }
      return res
    },
    /** @returns {boolean} */
    isLoadingAny () {
      return (this.isLoading && !this.aggregateSwitch) || (this.isLoadingAggregated && this.aggregateSwitch)
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
        EC50Results[cellLine] = {}
        for (const ptmType in this.oEC50Data[cellLine]) {
          EC50Results[cellLine][ptmType] = []
          for (const curveId in this.oEC50Data[cellLine][ptmType]) {
            if (curveId in curveStyleMapping) {
              // After some headache, it turns out curveStyleMapping, used in GenericHistogram,
              // actually comes from GenericLinePlot.vue
              // Oh god why.
              const EC50Line = Object.assign({}, curveStyleMapping[curveId]) // create copy
              EC50Line.value = -this.oEC50Data[cellLine][ptmType][curveId]
              EC50Line.curveid = curveId
              EC50Results[cellLine][ptmType].push(EC50Line)
            }
          }
        }
      }
      this.oEC50Curves = EC50Results
    },
    getEC50BackgroundData () {
      axios.get(this.$store.state.host + '/proteomicsdb/logic/drugcentric/getEC50Data.xsjs', {
        params: { drugName: this.drugName }
      })
        .then((response) => {
          this.ec50BackgroundData = response.data
        })
    },

    getCSV () {
      if (this.aggregateSwitch) {
        this.$refs.ddptmtableAggregated.onExporting(this.drugName)
      } else {
        this.$refs.ddptmtable.onExporting(this.drugName)
      }
    },
    getSVG () {
      this.downloadPlots('svg')
    },
    getPNG () {
      this.downloadPlots('png')
    },
    onSelectedRowsChanged (selection) {
      if (this.aggregateSwitch) {
        this.selectedCurveIDs = selection.map((s) => s.CURVE_IDS.split(';')).flat()
      } else {
        this.selectedCurveIDs = selection.map((s) => s.CURVE_ID)
      }
      this.oEC50Data = {}

      selection.forEach((s) => {
        if (!this.oEC50Data[s.CELLLINE_NAME]) {
          this.oEC50Data[s.CELLLINE_NAME] = {}
        }

        if (!this.oEC50Data[s.CELLLINE_NAME][s.MODIFICATION_TYPE]) {
          this.oEC50Data[s.CELLLINE_NAME][s.MODIFICATION_TYPE] = {}
        }

        if (this.aggregateSwitch) {
          s.CURVE_IDS.split(';').forEach((id) => {
            this.oEC50Data[s.CELLLINE_NAME][s.MODIFICATION_TYPE][id] = s['AVG(LOG_IC50)']
          })
        } else {
          this.oEC50Data[s.CELLLINE_NAME][s.MODIFICATION_TYPE][s.CURVE_ID] = s.LOG_IC50
        }
      })
    },
    unselectAllRows () {
      this.$refs.ddptmtableAggregated.unselectAllRows()
      this.$refs.ddptmtable.unselectAllRows()
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
.ddptmtable {
  width: 100%;
}
</style>

<template>
  <v-container>
    <LoadingOverlay :loading="loading" />

    <div class="d-flex pr-16 mb-4">
      <h1>Cell sensitivity</h1>

      <DownloadSpeedDial
        right
        absolute
        csv
        svg
        png
        :disabled="!isTissuesSelected || !isDrugsSelected"
        @csv="downloadCSV"
        @svg="downloadPlots(true)"
        @png="downloadPlots(false)"
      />
    </div>

    <v-row>
      <v-col
        cols="12"
      >
        <v-card elevation="0">
          <v-card-title>
            Dataset selection
          </v-card-title>

          <v-card-text>
            <v-autocomplete
              v-model="selectedDataset"
              :items="datasets"
              item-text="datasetName"
              return-object
              label="Dataset"
              outlined
              @change="loadCellLinesAndTreatments"
            />
          </v-card-text>

          <v-simple-table
            v-if="selectedDataset"
            dense
          >
            <template #default>
              <tbody>
                <tr>
                  <td>Dose response measurements:</td>
                  <td>{{ selectedDataset.NoOfDoseResponse }}</td>
                </tr>
                <tr>
                  <td>Fitted models:</td>
                  <td>{{ selectedDataset.ConvergedModels }}</td>
                </tr>
                <tr>
                  <td>DOI:</td>
                  <td>
                    <a
                      v-for="item in dois"
                      :key="item.text"
                      :href="item.href"
                    >{{ item.text }}</a>
                  </td>
                </tr>
                <tr>
                  <td>URI:</td>
                  <td>
                    <a
                      v-if="selectedDataset.URI"
                      :href="selectedDataset.URI"
                    >[1]</a>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-col>

      <v-col
        cols="12"
      >
        <v-card
          v-if="selectedDataset"
          elevation="0"
        >
          <v-card-title>
            <h2 align="left">
              Cell line and treatment selection
            </h2>
          </v-card-title>

          <v-card-text>
            <SelectMultipleAll
              v-model="selectedTissues"
              :items="celllines"
              item-text="celllineName"
              return-object
              label="Cell lines"
              select-all-text="Select all cell lines"
              outlined
              small-chips
              @change="onCelllineChange"
            />

            <SelectMultipleAll
              v-model="selectedDrugs"
              :items="drugs"
              item-text="drugName"
              return-object
              label="Treatments"
              select-all-text="Select all treatments"
              outlined
              small-chips
              @change="onDrugChange"
            />

            <v-simple-table
              v-if="selectedTissuesString && selectedDrugsString"
              dense
            >
              <template #default>
                <tbody>
                  <tr>
                    <td>
                      Fitted models by cell line and drug combination:
                    </td>
                    <td>{{ fittedCurves }}</td>
                  </tr>
                  <tr>
                    <td>Fitted models by interactive filter:</td>
                    <td>{{ selectedCurves }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        v-if="
          violinModel &&
            selectedTissues.length > 0 &&
            selectedDrugs.length > 0
        "
      >
        <v-card
          elevation="0"
          class="overflow-x-auto"
        >
          <v-card-text>
            <sensitivityparallelplot
              :min-width="1000"
              :min-height="400"
              :selected-dataset="selectedDataset"
              :selected-tissues="selectedTissuesString"
              :selected-drugs="selectedDrugsString"
              :violin-model="violinModelFiltered"
              @keyChange="onParCoordsChange"
              @selectedLinesChange="onSelectedLinesChange"
            />
            <v-progress-circular
              v-if="isLoading"
              class="progress"
              size="75"
              width="7"
              indeterminate
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        v-if="violinModelFiltered"
      >
        <v-card
          elevation="0"
          class="overflow-x-auto"
        >
          <v-card-text>
            <sensitivitybarplot
              :min-height="450"
              :selected-key="selectedKey"
              :selected-dataset="selectedDataset"
              :selected-tissues="selectedTissuesString"
              :selected-drugs="selectedDrugsString"
              :selected-lines-for-bar-plot="selectedLinesForBarPlot"
              :violin-model="violinModelFiltered"
              @send-message="onBarSelected"
              @clear-selection="$root.$emit('abort-pending-request')"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        v-if="isTissuesSelected && isDrugsSelected"
      >
        <v-card
          elevation="0"
          class="overflow-x-auto"
        >
          <v-card-text>
            <responsecurve
              :min-height="450"
              :min-width="1000"
              title="Dose response curve for selected drug/cell line combination"
              :model-ids="selectedCurveIDs"
              :selected-dataset="selectedDataset"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import sensitivityparallelplot from '@/vue-d3-component-wrappers/SensitivityParallelPlot'
import sensitivitybarplot from '@/vue-d3-component-wrappers/SensitivityBarPlot'
import responsecurve from '@/vue-d3-component-wrappers/ResponseCurve'
import utils from '../../utils/downloadUtils'

import SelectMultipleAll from '../../components/SelectMultipleAll'
import LoadingOverlay from '../../components/LoadingOverlay'
import DownloadSpeedDial from '../../components/DownloadSpeedDial'

export default {
  name: 'Cellsensitivity',
  components: {
    sensitivityparallelplot,
    sensitivitybarplot,
    responsecurve,
    LoadingOverlay,
    SelectMultipleAll,
    DownloadSpeedDial
  },
  data () {
    return {
      datasets: [],
      selectedDataset: null,
      celllines: [],
      selectedTissues: [],
      drugs: [],
      selectedDrugs: [],
      selectedKey: null,
      selectedLinesForBarPlot: '',
      violinModel: null,
      selectedCurveIDs: [],
      fittedCurves: 0,
      svgCss: [
        require('@/vue-d3-components/GenericBarPlot.css.prdb'),
        require('@/vue-d3-components/GenericLinePlot.css.prdb')
      ],
      isLoading: false,
      currentAxiosCancelTokenSource: undefined
    }
  },
  computed: {
    /** @returns {boolean} */
    loading () {
      return this.datasets.length === 0
    },
    /** @returns {number | string} */
    selectedCurves () {
      if (
        this.selectedLinesForBarPlot &&
          this.selectedLinesForBarPlot !== '-10' &&
          this.selectedLinesForBarPlot.length > 0
      ) {
        return this.selectedLinesForBarPlot.split(';').length
      }
      return ''
    },
    /** @returns {string | null} */
    selectedTissuesString () {
      if (this.selectedTissues) {
        return this.selectedTissues.map((d) => d.celllineId).join(';')
      }
      return null
    },
    /** @returns {string | null} */
    selectedDrugsString () {
      if (this.selectedDrugs) {
        return this.selectedDrugs.map((d) => d.drugId).join(';')
      }
      return null
    },
    /** @returns {boolean} */
    isTissuesSelected () {
      return this.selectedTissues.length > 0
    },
    /** @returns {boolean} */
    isDrugsSelected () {
      return this.selectedDrugs.length > 0
    },
    /** @returns {any} */
    violinModelFiltered () {
      if (this.selectedLinesForBarPlot === '') {
        return this.violinModel
      } else {
        const selectedLinesList = this.selectedLinesForBarPlot.split(';')
        return this.violinModel.map((obj) => {
          return {
            AttributeType: obj.AttributeType,
            data: obj.data.filter((datum) =>
            // Check if any of the datum's modelIDs is included in the list of selected lines
              datum.ModelId.split(';').filter(val => selectedLinesList.includes(val)).length > 0
            )
          }
        })
      }
    },
    /** @returns {{ text: string, href: string }[]} */
    dois () {
      if (this.selectedDataset.DOI) {
        const doi = this.selectedDataset.DOI.split('__').map(function (d, i) {
          return {
            text: `[${i + 1}]`,
            href: 'https://doi.org/' + d
          }
        })
        return doi
      } else {
        return []
      }
    }
  },
  watch: {
    selectedDataset () {
      this.getDataForViolinPlots()
    },
    selectedDrugs () {
      this.getDataForViolinPlots()
    },
    selectedTissues () {
      this.getDataForViolinPlots()
    }
  },
  mounted () {
    this.loadDatasets()
  },
  methods: {
    async loadDatasets () {
      const urlDatasets =
          this.$store.state.host +
          '/proteomicsdb/logic/cellSelectivity/getAllDatasets.xsjs?&taxcode=' +
          this.$store.state.organismTaxcode

      const response = await axios.get(urlDatasets, {})
      this.datasets = response.data
      if (this.datasets.length > 0) {
        this.selectedDataset = this.$route.params.defaultProject ? this.datasets.filter(d => d.datasetName === this.$route.params.defaultProject)[0] : this.datasets[0]
        this.loadCellLinesAndTreatments()
      }
    },
    loadCellLinesAndTreatments () {
      const that = this
      const urlDatasets =
          this.$store.state.host +
          '/proteomicsdb/logic/cellSelectivity/getCellLinesAndDrugsByDatasetId.xsjs'

      axios
        .get(urlDatasets, {
          params: {
            dataset_id: that.selectedDataset.datasetId
          }
        })
        .then(function (response) {
          that.celllines = response.data.cellline.filter(
            // TODO: Remove "All cellines" from backend
            d => d.celllineId !== 'not'
          )
          that.drugs = response.data.drug.filter(
            // TODO: Remove "All drugs" from backend
            d => d.drugId !== -1
          )
        })
    },
    getDataForViolinPlots () {
      // Create a token so the request can be cancelled if the next one overtakes it
      const cancelTokenSource = axios.CancelToken.source()
      // Abort a possible previous request
      if (this.currentAxiosCancelTokenSource) {
        this.currentAxiosCancelTokenSource.cancel()
        this.isLoading = false
      }
      this.currentAxiosCancelTokenSource = cancelTokenSource
      this.violinModel = undefined
      if (
        this.selectedDataset &&
          this.selectedDrugs.length > 0 &&
          this.selectedTissues.length > 0 &&
          !(this.selectedDrugs[0] === '-1' && this.selectedTissues[0] === 'not')
      ) {
        const urlDatasets =
            this.$store.state.host +
            '/proteomicsdb/logic/cellSelectivity/getDataForVioPlots.xsjs'
        this.isLoading = true
        axios
          .get(urlDatasets, {
            params: {
              dataset_id: this.selectedDataset.datasetId,
              drug_id: this.selectedDrugsString,
              cell_line_id: this.selectedTissuesString,
              BIC: 100,
              R2: 0,
              Effect: 0,
              Switch: 1,
              model_ids: this.selectedLinesForBarPlot
            },
            cancelToken: this.currentAxiosCancelTokenSource.token
          })
          .then((response) => {
            this.currentAxiosCancelTokenSource = undefined
            this.violinModel = response.data
            this.fittedCurves = 0
            if (this.violinModel && this.violinModel.length > 0) {
              this.fittedCurves = this.violinModel[0].data.reduce(function (
                acc,
                d
              ) {
                return acc + d.ModelId.split(';').length
              },
              0)
            }
            this.isLoading = false
          })
          .catch((error) => {
            if (!axios.isCancel(error)) {
              // eslint-disable-next-line no-console
              console.error(error)
            }
          })
      }
    },
    onCelllineChange (selection) {
      this.selectedLinesForBarPlot = ''
    },
    onDrugChange (selection) {
      this.selectedLinesForBarPlot = ''
    },
    onViolinUpdate (violinModel) {
      this.violinModel = violinModel
    },
    onParCoordsChange (selectedKey) {
      this.selectedKey = selectedKey
      this.selectedCurveIDs = []
    },
    onSelectedLinesChange (selectedLinesForBarPlot) {
      this.selectedLinesForBarPlot = selectedLinesForBarPlot
      this.selectedCurveIDs = []
    },
    onBarSelected (barPlotObject) {
      if (barPlotObject) {
        this.selectedCurveIDs = barPlotObject.SelectedModelIds.data
      }
    },
    downloadPlots (downloadAsSvg) {
      const aPlots = []
      if (this.selectedKey) {
        aPlots.push(
          document.getElementById('ic50Bar').getElementsByTagName('svg')[0]
        )
      }
      if (this.selectedCurveIDs.length > 0) {
        aPlots.push(
          document.getElementById('ic50Plot').getElementsByTagName('svg')[0]
        )
      }

      if (aPlots) {
        const sDataSetName = this.selectedDataset.datasetName
        utils.downloadSVGs(
          aPlots,
          'Dataset: ' + sDataSetName,
          downloadAsSvg,
          undefined,
          this.svgCss
        )
      }
    },
    downloadCSV () {
      const sDataSetName = this.selectedDataset.datasetName

      // if no lines are selected -> load original violin data into csv
      let aData = this.violinModel
      if (this.selectedLinesForBarPlot) {
        aData = this.violinModelFiltered
      }

      const aColumnNames = aData.map(d => d.AttributeType)

      const aDataValues = aData.map(d => d.data
        .sort((a, b) => {
          const cellLineCompare = a.CellLine.localeCompare(b.CellLine)
          return (cellLineCompare !== 0)
            ? cellLineCompare
            : a.Drug.localeCompare(b.Drug)
        })
        .map(e => e.VALUE)
      )

      const aDataValuesTransposed = aDataValues.reduce((prev, next) => next.map(
        (item, i) => (prev[i] || []).concat(next[i])
      ), [])

      const aCellLineDrugNames = aData.map(d => d.data.map(e => [e.CellLine, e.Drug]))

      const aDataTable = aDataValuesTransposed.map((a, i) => aCellLineDrugNames[0][i].concat(a))
      const csvHeader = ['CellLine', 'Drug'].concat(aColumnNames)

      utils.downloadCSV(`${sDataSetName}`, aDataTable, csvHeader)
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.progress {
  margin: 0 auto;
}
</style>

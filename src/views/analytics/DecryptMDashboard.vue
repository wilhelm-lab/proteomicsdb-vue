<template>
  <v-container
    class="grey lighten-3 pa-4"
    fluid
  >
    <v-row>
      <v-col>
        <v-card
          outlined
          color="transparent"
        >
          <v-card-title>
            <v-img
              :src="decryptmlogo"
              max-width="200"
              class="mr-4"
            />
            <h1 class="mb-2">
              Dashboard
            </h1>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-card flat>
          <v-card-title>Select Dataset</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="uuid"
              label="Session ID"
              :counter="32"
              :rules="sessionIDRules"
            />
            <v-autocomplete
              v-model="selectedUserDatasets"
              return-object
              :items="userDatasets"
              item-text="datasetName"
              item-value="datasetId"
              label="Uploaded Datasets"
              multiple
              clearable
            />
            <v-btn
              :disabled="selectedUserDatasets.length===0"
              color="success"
              class="mr-4"
              style="text-transform: none"
              :loading="isLoading"
              @click="loadData"
            >
              Load Dataset
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="9">
        <div
          class="histograms-placeholder mt-3"
        >
          <v-row class="d-flex">
            <v-col
              sm="12"
              class="d-flex justify-center align-center"
            >
              <v-alert
                color="blue-grey"
                text
                icon="mdi-exclamation"
                prominent
              >
                Good news y'all! <br> Implementing the comparison of data across conditions was easier than we thought. <br>
                The 'Uploaded Datasets' Menu now allows you to select multiple datasets. <br>
                Right now, you'll have to make do with one EC50/Intensity histogram for all the data together, but I'm working on that ;-)
              </v-alert>
            </v-col>
          </v-row>
          <v-row class="d-flex">
            <v-col
              sm="12"
              class="d-flex justify-center align-center"
            >
              <v-alert
                color="blue-grey"
                text
                icon="mdi-arrow-left"
              >
                Paste your Session ID, then select one (or multiple) of your datasets and click 'Load Dataset' to fetch the data from
                the server.
              </v-alert>
            </v-col>
          </v-row>
          <v-row>
            <v-col
              sm="12"
              class="d-flex justify-center align-center"
            >
              <v-alert
                color="blue-grey"
                text
                icon="mdi-arrow-down"
              >
                Select one or multiple rows in the table on the bottom of the page to show dose-response curves.
              </v-alert>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>
    <v-row class="my-1">
      <v-spacer />
      <downloader
        direction="left"
        svg
        png
        class="ml-2 mr-3"
        :loading="downloadLoading"
        @svg="getSVG"
        @png="getPNG"
      />
    </v-row>
    <v-row
      style="background-color: white"
      class="ma-1"
    >
      <v-col
        sm="12"
        md="12"
        lg="4"
      >
        <v-card
          flat
        >
          <v-card-text>
            <responsecurve
              ref="responseCurve"
              :min-height="600"
              :min-width="550"
              :model-ids="selectedCurveIDs"
              :legend-at-bottom="true"
              :is-user-curve="true"
              data-type="ptmCurves"
              :is-time-dependent="areAllSelectedDatasetsTimeDependent"
              :exponential-x="!areAllSelectedDatasetsTimeDependent"
              parent-perspective="drug"
              title="Dose-Response Curve"
              @mouseover-event="onMouseOverCurve"
              @click-event="onClickCurve"
              @update-curve-styles="updateCurveStylesForDecryptmDashboard"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        v-if="isLoading"
        cols="8"
        class="text-center mt-3"
      >
        <v-progress-circular
          class="progress"
          size="75"
          width="7"
          indeterminate
        />
        <h2>Loading Data...</h2>
      </v-col>
      <v-col
        v-if="dataIn && intensityBackgroundData.some(datapoint => !!datapoint)"
        sm="12"
        md="12"
        lg="4"
      >
        <v-card
          flat
        >
          <v-card-text>
            <intensityhistogram
              key="IntensityHisto"
              ref="intensityhistogram"
              title="Control Channel Log2 Intensity Distribution"
              :min-height="400"
              :min-width="550"
              :chart-data="intensityBackgroundData"
              :selected-lines="aSelectedCurvesControlIntensity"
              xlabel="Intensity"
              style=" background-color: #ffffff"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        v-if="dataIn"
        sm="12"
        md="12"
        lg="4"
      >
        <v-card
          flat
        >
          <v-card-text>
            <ec50histogram
              key="MyHisto"
              ref="ec50histogram"
              :min-height="400"
              :min-width="550"
              :chart-data="ec50BackgroundData"
              :title="'EC50 Distribution (n=' + ec50BackgroundData.length + ')'"
              :min-dose="Math.min(...userDatasetsInfo.map(info => info.MIN_DOSE))"
              :max-dose="Math.min(...userDatasetsInfo.map(info => info.MAX_DOSE))"
              :dose-unit="calculateDoseUnit()"
              :selected-lines="aEC50Curves"
              xlabel="log10(EC50)"
              style=" background-color: #ffffff"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-spacer />
      <columnchooser
        @toggle-column-chooser="toggleColumnChooser = !toggleColumnChooser"
      />
      <downloader
        direction="left"
        csv
        class="ml-2 mr-3"
        :loading="downloadLoading"
        @csv="getCSV"
      />
      <v-col cols="12">
        <decryptm-dashboard-table
          ref="userdecryptmtable"
          data-grid-ref-name="userdecryptmdatagrid"
          :data-in="dataIn"
          :toggle-column-chooser="toggleColumnChooser"
          :is-loading="isLoading"
          :filter-for-regulated="!areAllSelectedDatasetsTimeDependent"
          class="ddptmtable"
          @selected-rows-changed="onSelectedRowsChanged"
        />
      </v-col>
    </v-row>
    <template
      v-for="(residuesformatted, uniprotid) in selectedResiduesFormattedByUniprot"
    >
      <v-row
        :key="uniprotid+'-structure'"
      >
        <v-col cols="12">
          <v-card elevation="0">
            <v-card-title>
              Structure of {{ uniprotid }}
            </v-card-title>
            <v-card-subtitle>
              Highlighted positions: {{ displayFormattedResidues(residuesformatted) }}
            </v-card-subtitle>
            <v-card-text>
              <protvista-uniprot-structure
                :highlightresidues="residuesformatted"
                :accession="uniprotid"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <v-row v-if="uniprotsWithoutStructure.length>0">
      <v-col cols="12">
        <v-alert
          color="blue-grey"
          text
          icon="mdi-exclamation"
        >
          No structure available for: {{ uniprotsWithoutStructure.join(', ') }}
        </v-alert>
      </v-col>
    </v-row>
    <canvas
      id="canvasId"
      style="display: none"
    />
  </v-container>
</template>

<script>
import downloader from '@/components/DownloadSpeedDial'
import responsecurve from '@/vue-d3-component-wrappers/ResponseCurve'
import decryptmDashboardTable from '@/components/DecryptMDashboardTable'
import columnchooser from '@/components/ColumnChooserButton'
import axios from 'axios'
import utils from '../../utils/downloadUtils'
import ec50histogram from '@/vue-d3-component-wrappers/EC50Histogram'
import intensityhistogram from '@/vue-d3-component-wrappers/IntensityHistogram'
import uploadUtils from '../../plugins/CustomUploadUtils'
import ProtvistaUniprotStructure from 'protvista-proteomicsdb/src/protvista-uniprot-structure'

if (!window.customElements.get('protvista-uniprot-structure')) {
  window.customElements.define('protvista-uniprot-structure', ProtvistaUniprotStructure)
}

export default {
  name: 'DecryptMDashboard',
  components: {
    intensityhistogram,
    downloader,
    responsecurve,
    decryptmDashboardTable,
    columnchooser,
    ec50histogram
  },
  data: () => ({
    dataIn: undefined, // TODO: Refactor into store
    userDatasetsInfo: undefined,
    downloadLoading: false,
    dataGridInstance: null,
    selectedCurveIDs: [],
    selectedResiduesFormattedByUniprot: {},
    uniprotsWithoutStructure: [],
    isLoading: false,
    toggleColumnChooser: false,
    currentAxiosCancelTokenSource: null,
    uuid: '',
    userDatasets: [],
    selectedUserDatasets: [],
    aSelectedCurvesMetaData: [],
    aEC50Curves: [],
    aSelectedCurvesControlIntensity: [],
    sessionIDRules: [
      (sessionID) =>
        !!sessionID.match(/^[A-F0-9]{32}$/i) ||
          'Session ID must have a length of 32 characters and only contain "0-9, A-F".'
    ],
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')],
    regulationDictionary: { '-': 0, up: 1, down: -1 },
    decryptmlogo: require('@/assets/home/decryptm_logo.png'),
    mostRecentWorkingSessionID: null
  }),
  computed: {
    ec50BackgroundData () {
      return this.dataIn
        .filter(d => d.REGULATION !== '-')
        .map(d => {
            //It's called ec50, but actually is a logec50 value (shame on whoever coded this...)
            //So multiplying pEC50 with -1 is what it needs
          return { ec50: -d.DETAILS.pEC50, regulation: this.regulationDictionary[d.REGULATION] || 0 }
        })
    },
    intensityBackgroundData () {
      return this.dataIn
        .map(d => d.DETAILS['Curve signal'] || d.DETAILS.Signal)
    },
    areAllSelectedDatasetsTimeDependent () {
      return this.selectedUserDatasets.every(dataset => dataset.omicsType.startsWith('decryptM_td'))
    }
  },
  watch: {
    uuid: {
      immediate: true,
      async handler (newVal, oldVal) {
        if (newVal && newVal !== oldVal && newVal.length === 32) {
          const response = await axios.get(
            this.$store.state.host +
              '/proteomicsdb/logic/secure/checkSessionId.xsjs',
            { params: { uuid: newVal } }
          )
          if (response.data.cookieStatus === 0) {
            this.mostRecentWorkingSessionID = newVal
            const d = new Date()
            d.setTime(d.getTime() + 14 * 24 * 60 * 60 * 1000)
            this.$cookie.set('analyticsUploadSessionID', this.uuid, { expires: d })
            this.userDatasets = response.data.datasets.filter(d => d.omicsType.startsWith('decryptM'))
          } else {
            alert('The session ID you entered does not exist on the server. ' +
                'Reverting to the previous session ID.')
            this.uuid = this.mostRecentWorkingSessionID
          }
        }
      }
    }
  },
  created () {
    this.uuid = this.$cookie.get('analyticsUploadSessionID') || ''
  },
  methods: {
    loadData () {
      const searchUrl =
          this.$store.state.host +
          '/proteomicsdb/logic/customUserData/getUserProteomicsData.xsjs'
      // Create a token so the request can be cancelled if the next one overtakes it
      const cancelTokenSource = axios.CancelToken.source()
      // Abort a possible previous request
      if (this.currentAxiosCancelTokenSource) {
        this.currentAxiosCancelTokenSource.cancel()
      }
      this.currentAxiosCancelTokenSource = cancelTokenSource
      this.isLoading = true
      axios
        .get(searchUrl, {
          params: {
            userDatasetIds: this.selectedUserDatasets.map(dataset => dataset.datasetId).join(';')
          }
        })
        .then((response) => {
          this.currentAxiosCancelTokenSource = null
          // Hoist the detail dictionaries up into the top level
          // And concatenate peptide and fullprot data
          this.dataIn = response.data.peptideData.concat(response.data.fullProteomeData).map(datum => {
            return { ...datum, ...datum.DETAILS }
          })

          this.userDatasetsInfo = response.data.datasetInfo
          this.isLoading = false
          this.renewSession()
        })
    },
    saveGridInstance (e) {
      this.dataGridInstance = e.component
    },
    updateCurveStylesForDecryptmDashboard (curveStyleMapping) {
      this.aEC50Curves = this.aSelectedCurvesMetaData.map((d) => {
        const curveid = d.curveid
        const EC50Line = Object.assign({}, curveStyleMapping[curveid])
        EC50Line.curveid = curveid
        EC50Line.value = -d.logec50
        return EC50Line
      },

      this.aSelectedCurvesControlIntensity = this.aSelectedCurvesMetaData.map((d) => {
        const curveid = d.curveid
        const IntensityLine = Object.assign({}, curveStyleMapping[curveid])
        IntensityLine.curveid = curveid
        IntensityLine.value = d.controlIntensity
        return IntensityLine
      })
      )
    },
    getCSV () {
      this.$refs.userdecryptmtable.onExporting(this.selectedUserDatasets.map(dataset => dataset.datasetName).join(', '))
    },
    getSVG () {
      this.downloadPlots('svg')
    },
    getPNG () {
      this.downloadPlots('png')
    },
    onSelectedRowsChanged (selection) {
      if (selection) {
        this.selectedCurveIDs = selection.map((s) => s.CURVE_ID)
        this.aSelectedCurvesMetaData = selection.map(s => {
          return {
            curveid: s.CURVE_ID,
            logec50: s.DETAILS.pEC50,
            controlIntensity: s.DETAILS['Curve signal'] || s.DETAILS.Signal
          }
        })

        // Now the residues for highlighting in the 3D model
        // In order to avoid errors, first filter for those peptides that have an annotated start position
        // (that means they have all required information to visualize)
        const selectionWithPosition = selection.filter(s => s.START_POSITIONS)

        const selectedResiduesStartPos = selectionWithPosition.map((s) => s.START_POSITIONS.split(';'))
        const selectedResiduesEndPos = selectionWithPosition.map((s) => s.END_POSITIONS.split(';'))

        // For determining the exact position(s) to highlight, we need to know where in the peptide we have modifications
        const modificationPositions = selectionWithPosition.map((s) => {
          let intermediateSequence = s.MOD_SEQUENCE
          const res = []
          let modIndex = intermediateSequence.indexOf('(')
          while (modIndex !== -1) {
            res.push(modIndex)
            intermediateSequence = intermediateSequence.replace(/\([a-z]+\)/, '')
            modIndex = intermediateSequence.indexOf('(')
          }
          return res
        })

        const selectedResidueUniprotIds = selectionWithPosition.map(s => s.UNIPROT_ACCS.split(';'))
        this.uniprotsWithoutStructure = selectionWithPosition
          .map(s => s.UNIPROT_ACCS.split(';')
            .filter(acc => acc.includes('-'))).flat()

        const selectedResiduesFormattedByUniprotUnfiltered = {}

        for (let proteinIndex = 0; proteinIndex < selectedResidueUniprotIds.length; proteinIndex++) {
          for (let isoformIndex = 0; isoformIndex < selectedResidueUniprotIds[proteinIndex].length; isoformIndex++) {
            if (!(selectedResidueUniprotIds[proteinIndex][isoformIndex] in selectedResiduesFormattedByUniprotUnfiltered)) {
              selectedResiduesFormattedByUniprotUnfiltered[selectedResidueUniprotIds[proteinIndex][isoformIndex]] = []
            }
            if (modificationPositions[proteinIndex].length > 0) {
              modificationPositions[proteinIndex].forEach(pos => {
                const absolutePosition = Number(selectedResiduesStartPos[proteinIndex][isoformIndex]) + Number(pos)
                selectedResiduesFormattedByUniprotUnfiltered[selectedResidueUniprotIds[proteinIndex][isoformIndex]].push(
                    `${absolutePosition}:${absolutePosition}`)
              })
            } else {
              selectedResiduesFormattedByUniprotUnfiltered[selectedResidueUniprotIds[proteinIndex][isoformIndex]].push(
                  `${Number(selectedResiduesStartPos[proteinIndex][isoformIndex]) + 1}:${selectedResiduesEndPos[proteinIndex][isoformIndex]}`)
            }
          }
        }

        // Filter out isoforms, they have no structures apparently (it would be better to actually check if there
        // is a structure, but that would have to be an async request)
        // Isoforms can be identified by their hyphen
        this.selectedResiduesFormattedByUniprot = {}
        for (const uniprot in selectedResiduesFormattedByUniprotUnfiltered) {
          if (!this.uniprotsWithoutStructure.includes(uniprot)) this.selectedResiduesFormattedByUniprot[uniprot] = selectedResiduesFormattedByUniprotUnfiltered[uniprot].join(',')
        }
      } else {
        this.selectedCurveIDs = []
        this.aSelectedCurvesMetaData = []
      }
    },
    downloadPlots (type) {
      this.downloadLoading = true
      const aPlots = []
      for (const refKey in this.$refs) {
        if (refKey.includes('responseCurve') || refKey.includes('histogram')) {
          // Vue returns a singleton array if the ref was defined in a for loop.
          let domElement = this.$refs[refKey]
          if (Array.isArray(domElement)) domElement = domElement[0]
          const svg = domElement.getSVG()
          if (svg) aPlots.push(svg)
        }
      }

      if (aPlots) {
        utils.downloadSVGs(
          aPlots,
          'Dose Response: ' + this.selectedUserDatasets.map(dataset => dataset.datasetName).join(', '),
          type === 'svg',
          'canvasId',
          this.svgCss
        )
      }
      this.downloadLoading = false
    },
    onMouseOverCurve: function (curveId) {

    },
    onClickCurve: function (curveId) {

    },
    renewSession () {
      uploadUtils.renewSession(this.$store.state.host, this.uuid)
    },
    calculateDoseUnit () {
      return [...new Set(this.userDatasetsInfo.map(info => info.DOSE_UNIT))].join(',')
    },
    // async hasStructures (uniprot) {
    //   // TODO: This is not working because v-if does not work with async. So it is showing empty structures right now.
    //   // Check if there are any structural references at EBI
    //   const ebiResponse = await axios.get(`https://www.ebi.ac.uk/proteins/api/proteins/${uniprot}`)
    //   const structureReferences = ebiResponse.data.dbReferences.filter(ref => ref.type === 'PDB' || ref.type === 'AlphaFoldDB')
    //   return structureReferences.length > 0
    // },
    displayFormattedResidues (residuestring) {
      // The string looks like so: 831:831,832:832,1625:1630,
      // So it can be either individual residues or residue ranges
      // The above example should be displayed like so: 831,832,1625-1630
      return residuestring.split(',').filter(s => s !== '').map(substring => {
        const start = substring.split(':')[0]
        const end = substring.split(':')[1]
        if (start === end) return start
        else return `${start}-${end}`
      }).join(', ')
    }
  }

}
</script>

<style lang="scss" scoped>
.ddptmtable {
  width: 100%;
}

h1 {
  font-size: 32pt;
}

</style>

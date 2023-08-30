<template>
  <v-container>
    <LoadingOverlay :loading="isFetchingProteins" />

    <div class="d-flex pr-16">
      <h1>Inhibitor potency / selectivity analysis</h1>

      <DownloadSpeedDial
        absolute
        right
        csv
        svg
        png
        :disabled="!selectedProtein"
        @csv="getCSV"
        @svg="getSVG"
        @png="getPNG"
      />
    </div>

    <v-card
      elevation="0"
      class="mb-4"
    >
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            lg="6"
          >
            <v-subheader>EC50 Range</v-subheader>
            <v-range-slider
              v-model="rangeEC50"
              thumb-label="always"
              step="1"
              :max="maxEC50"
              :min="minEC50"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
          >
            <v-subheader>Minimum R2</v-subheader>
            <v-slider
              v-model="selectedR2Min"
              thumb-label="always"
              step="0.01"
              thumb-size="40"
              :max="1.0"
              :min="0.0"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
          >
            <v-text-field
              v-model="proteinSearchText"
              :loading="isFetchingProteins"
              label="Enter protein name"
              append-icon="mdi-magnify"
              outlined
              @click:append="searchTargetProteins"
              @keyup.enter="searchTargetProteins"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
          >
            <v-select
              v-if="
                availableTargetProteins && availableTargetProteins.length > 0
              "
              v-model="selectedProtein"
              :items="availableTargetProteins"
              outlined
              :item-text="
                (protein) =>
                  `${protein.gene_name} (${protein.unique_identifier})`
              "
              label="Please Select"
              auto-select-first
              return-object
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col>
        <v-card
          v-if="selectedProtein"
          elevation="0"
          class="mb-4"
        >
          <v-card-title
            primary-title
          >
            pEC50 distribution of drugs targeting<br>
            {{ selectedProtein.protein_name }} ({{ selectedProtein.unique_identifier }})
          </v-card-title>
          <v-card-text class="overflow-x-auto">
            <SelectivityViolinPlot
              ref="violinPlot"
              :violin-width="200"
              :height="300"
              :ed50-min="rangeEC50[0]"
              :ed50-max="rangeEC50[1]"
              :r2-min="selectedR2Min"
              :selected-target-protein="selectedProtein"
              :drug-id-selection="drugIdSelection"
              @select-drug="onSelectDrug"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        v-if="selectedDrug"
        cols="12"
        lg="6"
      >
        <v-card
          class="pa-3 d-flex overflow-x-auto"
          elevation="0"
        >
          <SelectivityIC50BarsWrapper
            ref="IC50Bars"
            :selected-drug="selectedDrug"
            :selected-protein="selectedProteinDrugDetails"
            :active-protein="activeProtein"
            :height="400"
            :bar-width="10"
            @select-protein="onSelectActiveProtein"
          />
        </v-card>
      </v-col>

      <v-col
        v-if="activeProtein && selectedDrug"
        cols="12"
        lg="6"
      >
        <v-card
          class="pa-3 d-flex overflow-x-auto"
          elevation="0"
        >
          <SelectivityIC50PlotWrapper
            ref="IC50Plot"
            :drug="selectedDrug"
            :selected-protein="activeProtein"
            :height="400"
            :width="500"
          />
        </v-card>
      </v-col>
    </v-row>

    <canvas
      id="canvasId"
      style="display: none"
    />

    <v-snackbar v-model="showSnackbar">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import utils from '../../utils/downloadUtils'
import SelectivityViolinPlot from './SelectivityViolinPlot'
import SelectivityIC50PlotWrapper from './SelectivityIC50PlotWrapper'
import SelectivityIC50BarsWrapper from './SelectivityIC50BarsWrapper'
import LoadingOverlay from '@/components/LoadingOverlay'

export default {
  name: 'SelectivityView',
  components: {
    SelectivityViolinPlot,
    SelectivityIC50PlotWrapper,
    SelectivityIC50BarsWrapper,
    DownloadSpeedDial,
    LoadingOverlay
  },
  data () {
    return {
      minEC50: 0,
      maxEC50: 10000,
      rangeEC50: [0, 3000],
      selectedR2Min: 0.8,
      isFetchingProteins: false,
      proteinSearchText: '',
      availableTargetProteins: [],
      selectedProtein: null,
      activeProtein: null,
      selectedDrug: null,
      svgCSS: [
        require('./D3ViolinPlot.css.prdb'),
        require('./IC50Plot.css.prdb'),
        require('./IC50Bars.css.prdb')
      ],
      snackbarMessage: null,
      showSnackbar: false,
      abortController: null,
      loading: false
    }
  },
  computed: {
    /** @returns {any} */
    selectedProteinDrugDetails: function () {
      if (!this.selectedDrug || !this.selectedProtein) {
        return null
      }
      return this.selectedDrug.data
        .filter((prot) => prot.PROTEIN_ID === this.selectedProtein.protein_id)
        .pop()
    },
    /** @returns {any[]} */
    drugIdSelection () {
      return this.selectedProtein
        ? this.selectedProtein.inhibitors.map(
          (inhibitor) => inhibitor.inhibitor_id
        )
        : []
    }
  },
  watch: {
    selectedR2Min () {
      this.searchTargetProteins()
    },
    rangeEC50 () {
      this.searchTargetProteins()
    }
  },
  methods: {
    onSelectActiveProtein (e) {
      this.activeProtein = e
    },
    onSelectDrug (e) {
      this.selectedDrug = e
      this.activeProtein = this.selectedProteinDrugDetails
    },
    searchTargetProteins () {
      const query = this.proteinSearchText
      if (!query || query.trim().length === 0) return

      // query must not contain quotation marks
      if (/["]/.test(query)) {
        this.showUserWarning('No quotation marks allowed!')
        return
      }

      // query must have at least 3 letters and digits
      if (query.length - query.split(/[a-z]|[\d]/i).join('').length < 3) {
        this.showUserWarning(
          'Please provide three or more alphanumeric characters!'
        )
        return
      }

      if (this.abortController) {
        this.abortController.abort()
      }
      this.abortController = new AbortController()

      this.isFetchingProteins = true

      axios
        .get(
          `${this.$store.state.host}/logic/getAvailableProteinTargets.xsjs`,
          {
            params: {
              ed50_min: this.rangeEC50[0],
              ed50_max: this.rangeEC50[1],
              r2_min: this.selectedR2Min,
              search_string: query,
              taxcode: this.$store.state.organismTaxcode
            },
            signal: this.abortController.signal
          }
        )
        .then((response) => {
          this.availableTargetProteins = response.data

          // Automatically select first protein
          if (
            this.availableTargetProteins &&
            this.availableTargetProteins.length > 0
          ) {
            this.selectedProtein = this.availableTargetProteins[0]
          } else {
            this.selectedProtein = null
          }
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            // eslint-disable-next-line no-console
            console.error(error)
            let msg = 'Error searching proteins...'
            if (error.response && error.response.data && error.response.data.message) {
              msg = error.response.data.message
            }
            this.showUserWarning(msg)
          }
        })
        .finally(() => {
          this.isFetchingProteins = false
          this.selectedDrug = null
          this.activeProtein = null
          this.b50PlotData = null
        })
    },
    downloadPlots (type) {
      const plots = []
      const fileName = `${this.selectedProtein.protein_name} (${this.selectedProtein.unique_identifier})`
      plots.push(this.$refs.violinPlot.getSVG())

      if (this.$refs.IC50Bars && this.$refs.IC50Plot) {
        plots.push(this.$refs.IC50Bars.getSVG())
        plots.push(this.$refs.IC50Plot.getSVG())
      }

      if (plots) {
        utils.downloadSVGs(
          plots,
          fileName,
          type === 'svg',
          'canvasId',
          this.svgCSS
        )
      }
    },
    getSVG () {
      this.downloadPlots('svg')
    },
    getPNG () {
      this.downloadPlots('png')
    },
    showUserWarning (msg) {
      this.showSnackbar = true
      this.snackbarMessage = msg
    },
    getCSV () {
      this.$refs.violinPlot.getCSV()
    }
  }
}
</script>

<style>
.b50-container {
  gap: 10px;
}

</style>

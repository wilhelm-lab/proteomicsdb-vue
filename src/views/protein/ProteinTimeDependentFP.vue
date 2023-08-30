<template>
  <v-row>
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <column-chooser-button
          @toggle-column-chooser="toggleColumnChooser = !toggleColumnChooser"
        />
        <download-speed-dial
          direction="left"
          csv
          svg
          png
          :loading="loading"
          class="ml-2 mr-3"
          @csv="getCSV"
          @svg="getSVG"
          @png="getPNG"
        />
      </v-row>
    </v-col>

    <v-col cols="12">
      <the-protein-tdfp-table
        ref="tdfptable"
        :data-grid-ref-name="dataGridRefName"
        :data-in="dataIn"
        :protein-accession="proteinInfo.uniprotId"
        :toggle-column-chooser="toggleColumnChooser"
        class="tdfptable"
        @selected-rows-changed="onSelectedRowsChanged"
      />
    </v-col>

    <v-col cols="12">
      <v-card elevation="0">
        <v-card-text>
          <responsecurve
            v-if="selectedCurveIDs.length"
            ref="responseCurve"
            :min-height="650"
            :min-width="600"
            :legend-at-bottom="true"
            :model-ids="selectedCurveIDs"
            :drug-names="selectedCurveDrugs"
            data-type="ptmCurves"
            :is-full-proteome="true"
            :is-time-dependent="true"
            parent-perspective="protein"
            :exponential-x="false"
          />
          <v-alert
            v-else
            color="blue-grey"
            text
            icon="mdi-arrow-up"
          >
            Select one or more entries above to show their dose-response curves here.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-col>

    <canvas
      id="canvasId"
      style="display: none"
    />

    <router-view />
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import utils from '../../utils/downloadUtils'

import TheProteinTdfpTable from '../../components/partials/protein/tdfp/TheProteinTdfpTable'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ColumnChooserButton from '@/components/ColumnChooserButton'
import responsecurve from '@/vue-d3-component-wrappers/ResponseCurve'

export default {
  components: {
    DownloadSpeedDial,
    ColumnChooserButton,
    responsecurve,
    TheProteinTdfpTable
  },
  data: () => ({
    loading: false,
    dataGridRefName: 'tdfptable',
    selectedCurveIDs: [],
    selectedCurveDrugs: [],
    toggleColumnChooser: false,
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      dataIn: 'protein/cellPerturbation/timeDependentFp/getData'
    })
  },
  methods: {
    getCSV () {
      this.$refs.tdfptable.onExporting()
    },
    getSVG () {
      this.downloadPlots('svg')
    },
    getPNG () {
      this.downloadPlots('png')
    },
    onSelectedRowsChanged (selection) {
      this.selectedCurveIDs = selection.map((s) => s.CURVE_ID)
      this.selectedCurveDrugs = selection.map((s) => s.DRUG_NAME)
    },
    downloadPlots (type) {
      this.loading = true
      const aPlots = []
      aPlots.push(this.$refs.responseCurve.getSVG())

      if (aPlots) {
        utils.downloadSVGs(
          aPlots,
          'Dose Response: ' + this.proteinInfo.uniprotId,
          type === 'svg',
          'canvasId',
          this.svgCss
        )
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.tdfptable {
  width: 100%;
}
</style>

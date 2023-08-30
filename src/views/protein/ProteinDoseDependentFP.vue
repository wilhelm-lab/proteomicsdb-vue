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
      <the-protein-ddfp-table
        ref="ddfptable"
        :data-grid-ref-name="dataGridRefName"
        :data-in="dataIn"
        :protein-accession="proteinInfo.uniprotId"
        :toggle-column-chooser="toggleColumnChooser"
        class="ddfptable"
        @selected-rows-changed="onSelectedRowsChanged"
      />
    </v-col>

    <v-col cols="12">
      <v-card elevation="0">
        <v-card-text>
          <response-curve
            v-if="selectedCurveIDs.length"
            ref="responseCurve"
            :min-height="650"
            :min-width="600"
            :legend-at-bottom="true"
            :model-ids="selectedCurveIDs"
            :drug-names="selectedCurveDrugs"
            data-type="ptmCurves"
            :is-full-proteome="true"
            parent-perspective="protein"
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
import utils from '../../utils/downloadUtils'
import { mapGetters } from 'vuex'

import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ColumnChooserButton from '@/components/ColumnChooserButton'
import ResponseCurve from '@/vue-d3-component-wrappers/ResponseCurve'
import TheProteinDdfpTable from '../../components/partials/protein/proteinddfp/TheProteinDdfpTable'

export default {
  components: {
    DownloadSpeedDial,
    ColumnChooserButton,
    ResponseCurve,
    TheProteinDdfpTable
  },
  data: () => ({
    loading: false,
    dataGridRefName: 'ddfptable',
    selectedCurveIDs: [],
    selectedCurveDrugs: [],
    toggleColumnChooser: false,
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      dataIn: 'protein/cellPerturbation/doseDependentFp/getData'
    })
  },
  methods: {
    getCSV () {
      this.$refs.ddfptable.onExporting()
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
.ddfptable {
  width: 100%;
}
</style>

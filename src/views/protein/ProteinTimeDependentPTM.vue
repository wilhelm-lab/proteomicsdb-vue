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
      <the-protein-tdptm-table
        ref="tdptmtable"
        :data-grid-ref-name="dataGridRefName"
        :data-in="dataIn"
        :protein-accession="proteinInfo.uniprotId"
        :toggle-column-chooser="toggleColumnChooser"
        class="tdptmtable"
        @selected-rows-changed="onSelectedRowsChanged"
      />
    </v-col>

    <v-col
      cols="12"
      lg="6"
    >
      <v-card
        elevation="0"
        class="overflow-auto"
      >
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

    <v-col
      cols="12"
      lg="6"
    >
      <v-card elevation="0">
        <v-card-title>Structure of {{ proteinInfo.uniprotId }}</v-card-title>
        <v-card-actions>
          <protvista-uniprot-structure
            ref="proteinStructure"
            :accession="proteinInfo.uniprotId || ''"
            :highlightresidues="selectedResiduesFormatted"
          />
        </v-card-actions>
        <v-card-text class="text-right">
          <span style="vertical-align: 50%">Powered by </span>
          <a
            href="https://github.com/ebi-webcomponents/protvista-uniprot"
            target="_blank"
          >
            <v-img
              :src="require('@/assets/commons/uniprot.svg')"
              width="75px"
              style="display: inline-block"
            />
          </a>
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
import TheProteinTdptmTable from '../../components/partials/protein/tdptm/TheProteinTdptmTable'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ColumnChooserButton from '@/components/ColumnChooserButton'
import ResponseCurve from '@/vue-d3-component-wrappers/ResponseCurve'
import { mapGetters } from 'vuex'
import ProtvistaUniprotStructure from 'protvista-proteomicsdb/src/protvista-uniprot-structure'

if (!window.customElements.get('protvista-uniprot-structure')) {
  window.customElements.define('protvista-uniprot-structure', ProtvistaUniprotStructure)
}

export default {
  components: {
    DownloadSpeedDial,
    ColumnChooserButton,
    ResponseCurve,
    TheProteinTdptmTable
  },
  data: () => ({
    loading: false,
    dataGridRefName: 'tdptmtable',
    selectedCurveIDs: [],
    selectedResiduesFormatted: '',
    selectedCurveDrugs: [],
    toggleColumnChooser: false,
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      dataIn: 'protein/cellPerturbation/timeDependentPtm/getData'
    })
  },
  watch: {
    proteinInfo (newVal) {
      // Hacky way of forcing the structure to rerender
      // Otherwise the structure will not show if a user directly accesses the ddptm site via the URL
      this.$refs.proteinStructure.accession = newVal.uniprotId
      this.$refs.proteinStructure.connectedCallback()
    }
  },
  methods: {
    getCSV () {
      this.$refs.tdptmtable.onExporting()
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

      // Now the residues for highlighting in the 3D model
      // In order to avoid errors, first filter for those peptides that have an annotated start position
      // (that means they have all required information to visualize)
      const selectionWithPosition = selection.filter(s => s.START_POSITION)

      const selectedResiduesStartPos = selectionWithPosition.map((s) => s.START_POSITION)
      const selectedResiduesEndPos = selectionWithPosition.map((s) => s.END_POSITION)

      this.selectedResiduesFormatted = selectionWithPosition.map((selectedCurve, i) => {
        // For determining the exact position(s) to highlight, we need to know where in the peptide we have modifications
        const modificationPositions = []
        let intermediateSequence = selectedCurve.MOD_SEQUENCE
        let modIndex = intermediateSequence.indexOf('(')
        while (modIndex !== -1) {
          modificationPositions.push(modIndex)
          intermediateSequence = intermediateSequence.replace(/\([a-z]+\)/, '')
          modIndex = intermediateSequence.indexOf('(')
        }
        if (modificationPositions.length > 0) {
          const resArray = []
          modificationPositions.forEach(pos => {
            const absolutePosition = Number(selectedResiduesStartPos[i]) + Number(pos)
            resArray.push(`${absolutePosition}:${absolutePosition}`)
          })
          return resArray.join(',')
        } else {
          return `${selectedResiduesStartPos[i] + 1}:${selectedResiduesEndPos[i]}`
        }
      })
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
.tdptmtable {
  width: 100%;
}
</style>

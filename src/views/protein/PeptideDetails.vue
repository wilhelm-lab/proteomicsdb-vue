<template>
  <dialog-page>
    <template #title>
      <h2 class="text-h5 mr-2">
        MS/MS Spectra for:
      </h2>
      <code class="text-h5">{{ peptideSequence }}</code>
    </template>

    <v-row>
      <v-col
        cols="12"
        style="position: relative;"
      >
        <loading-overlay
          :loading="tableLoading"
        />
        <DxDataGrid
          ref="dataGrid"
          :data-source="dataSource"
          :show-borders="true"
          :column-auto-width="true"
          :allow-column-resizing="true"
          column-resizing-mode="widget"
          :hover-state-enabled="true"
          :scrolling="{ useNative: true }"
          :selection="{ mode: 'single' }"
          @rowClick="handleRowClick"
          @exporting="onExporting"
        >
          <DxExport :enabled="true" />
          <DxColumnChooser
            :enabled="true"
            :allow-search="true"
            mode="select"
          />
          <DxFilterRow
            :visible="true"
          />
          <DxColumn
            caption="Plain Sequence"
            data-field="PEPTIDE_SEQUENCE"
          />
          <DxColumn
            caption="-log q-value"
            data-field="LOG_Q_VALUE"
          />
          <DxColumn
            caption="-log PEP"
            data-field="LOG_PEP"
          />
          <DxColumn
            caption="Search Engine"
            data-field="SEARCH_ENGINE_TEXT"
          />
          <DxColumn
            caption="Score"
            data-field="SCORE"
          />
          <DxColumn
            caption="Delta Score"
            data-field="DELTA_SCORE"
          />
          <DxColumn
            caption="Threshold Score"
            data-field="THRESHOLD_SCORE"
          />
          <DxColumn
            caption="Rank"
            data-field="RANK"
          />
          <DxColumn
            caption="m/z"
            data-field="RECALIBRATED_PRECURSOR_MZ"
          />
          <DxColumn
            caption="z"
            data-field="PRECURSOR_CHARGE"
          />
          <DxColumn
            caption="Theoretical Mr [Da]"
            data-field="THEO_MOD_PEPTIDE_MASS"
          />
          <DxColumn
            caption="Measured Mr [Da]"
            data-field="OBS_MOD_PEPTIDE_MASS"
          />
          <DxColumn
            caption="Mass Error [Da]"
            data-field="MASS_ERROR_DA"
          />
          <DxColumn
            caption="Mass Error [ppm]"
            data-field="MASS_ERROR_PPM"
          />
          <DxColumn
            caption="Fixed Modifications"
            data-field="FIXED_MODIFICATION_STRING"
          />
          <DxColumn
            caption="Variable Modifications"
            data-field="VARIABLE_MODIFICATION_STRING"
          />
          <DxColumn
            caption="Uniqueness"
            data-field="UNIQUENESS"
          />
          <DxColumn
            caption="Start"
            data-field="START_POSITION"
          />
          <DxColumn
            caption="Stop"
            data-field="END_POSITION"
          />
          <DxColumn
            caption="Protease"
            data-field="PROTEASE_NAME"
          />
          <DxColumn
            caption="Project"
            data-field="PROJECT_NAME"
          />
          <DxColumn
            caption="Experiment"
            data-field="EXPERIMENT_NAME"
          />
          <DxColumn
            caption="Retention Time"
            data-field="RETENTION_TIME"
          />
          <DxColumn
            caption="Scan"
            data-field="SPECTRUM_ID"
          />
          <DxColumn
            caption="MS File Name"
            data-field="MSFILE_NAME"
          />
          <DxPaging :page-size="5" />
          <DxPager
            :show-page-size-selector="false"
            :allowed-page-sizes="[5]"
          />
        </DxDataGrid>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-if="selectedIdentification"
        style="position: relative;"
      >
        <loading-overlay
          :loading="spectrumLoading"
        />
        <SpectrumWrapper
          ref="spectrumWrapper"
          :spectrum-entry="selectedIdentification"
          :peptide-id="peptideId.toString()"
          :peptide-sequence="peptideSequence"
          @plottingFinished="handlePlottingFinished"
        />
      </v-col>
      <v-col v-else>
        <v-alert
          color="blue-grey"
          text
          icon="mdi-arrow-up"
        >
          Select an identification entry from the table above to load the MS/MS spectrum here.
        </v-alert>
      </v-col>
    </v-row>
  </dialog-page>
</template>

<script>
// TODO: dedupe with ReferencePeptideDetails.vue
import 'devextreme/data/odata/store'
import {
  DxExport,
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager,
  DxFilterRow,
  DxColumnChooser
} from 'devextreme-vue/data-grid'

import { mapGetters } from 'vuex'

import downloadUtils from '../../utils/downloadUtils'

import DialogPage from '@/components/DialogPage'
import LoadingOverlay from '@/components/LoadingOverlay'
import SpectrumWrapper from '@/vue-d3-component-wrappers/SpectrumWrapper'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxColumnChooser,
    DxExport,
    DialogPage,
    LoadingOverlay,
    SpectrumWrapper
  },
  data: () => ({
    spectrumLoading: false,
    tableLoading: true,
    dataSource: {},
    selectedIdentification: null,
    peptideSequence: ''
  }),
  computed: {
    /** @returns {number} */
    peptideId () {
      return this.$route.params.peptideId
    },
    /** @returns {string} */
    proteinId () {
      return this.$route.params.proteinId
    },
    ...mapGetters({
      proteinInfo: 'protein/getProteinInfo'
    })
  },
  mounted () {
    this.setData()
  },
  methods: {
    onExporting (e) {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinInfo.uniprotId}_peptide_${this.peptideSequence}_psms.csv`,
        this.$refs.dataGrid
      )

      e.cancel = true
    },
    handleRowClick (row) {
      this.spectrumLoading = true
      this.selectedIdentification = row.data
    },
    handlePlottingFinished () {
      this.spectrumLoading = false
    },
    setData () {
      this.dataSource = {
        store: {
          type: 'odata',
          key: 'IDENTIFICATION_ID',
          url: this.$store.state.host +
            '/proteomicsdb/logic/peptideDetails.xsodata/InputParams(PROTEINFILTER=' +
            this.proteinId +
            ',PEPTIDEFILTER=' +
            this.peptideId +
            ')/Results',
          onLoaded: (oData) => {
            if (oData.length > 0 && this.peptideSequence === '') {
              this.peptideSequence = oData[0].PEPTIDE_SEQUENCE
            }

            this.tableLoading = false
          }
        },
        reshapeOnPush: true,
        select: [
          'IDENTIFICATION_ID',
          'PEPTIDE_SEQUENCE',
          'FULL_SEQUENCE',
          'LOG_Q_VALUE',
          'LOG_PEP',
          'SEARCH_ENGINE_TEXT',
          'SCORE',
          'DELTA_SCORE',
          'THRESHOLD_SCORE',
          'RANK',
          'RECALIBRATED_PRECURSOR_MZ',
          'PRECURSOR_CHARGE',
          'THEO_MOD_PEPTIDE_MASS',
          'OBS_MOD_PEPTIDE_MASS',
          'MASS_ERROR_DA',
          'MASS_ERROR_PPM',
          'FIXED_MODIFICATION_STRING',
          'VARIABLE_MODIFICATION_STRING',
          'UNIQUENESS',
          'START_POSITION',
          'END_POSITION',
          'PROTEASE_NAME',
          'PROJECT_NAME',
          'EXPERIMENT_NAME',
          'RETENTION_TIME',
          'SPECTRUM_ID',
          'MSFILE_NAME',
          'PEPTIDE_ID'
        ]
      }
    }
  }
}
</script>

<style scoped>
code.text-h5 {
  font-family: monospace !important;
}
</style>

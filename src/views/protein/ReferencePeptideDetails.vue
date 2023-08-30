<template>
  <dialog-page>
    <template #title>
      <h2 class="text-h5 mr-2">
        Reference Spectra for:
      </h2>
      <code class="text-h5">{{ peptideSequence }}</code>
    </template>

    <v-row>
      <v-col style="position: relative;">
        <loading-overlay
          :loading="tableLoading"
        />
        <DxDataGrid
          ref="referencePeptideDetailsGrid"
          :data-source="dataSource"
          :show-borders="true"
          :column-auto-width="true"
          :allow-column-resizing="true"
          column-resizing-mode="widget"
          :scrolling="{ useNative: true }"
          :hover-state-enabled="true"
          @rowClick="handleRowClick"
        >
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
            data-field="SEQUENCE"
          />
          <DxColumn
            caption="Sequence"
            data-field="FULL_SEQUENCE"
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
            caption="Fragmentation Method"
            data-field="FRAGMENTATION_TECHNIQUE"
          />
          <DxColumn
            caption="Collision energy"
            data-field="ENERGY"
          />
          <DxColumn
            caption="Mass Analyzer"
            data-field="MASS_ANALYZER"
          />
          <DxColumn
            caption="Charge"
            data-field="PRECURSOR_CHARGE"
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
            caption="Project"
            data-field="PROJECT_NAME"
          />
          <DxColumn
            caption="Experiment"
            data-field="EXPERIMENT_NAME"
          />
          <DxColumn
            caption="Scan number"
            data-field="SCAN_NUMBER"
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
        <spectrum-wrapper
          ref="spectrumWrapper"
          :spectrum-entry="selectedIdentification"
          :peptide-id="peptideId.toString()"
          :peptide-sequence="peptideSequence"
          is-reference-spectrum
          @plottingFinished="handlePlottingFinished"
        />
      </v-col>
      <v-col v-else>
        <v-alert
          color="blue-grey"
          text
          icon="mdi-arrow-up"
        >
          Select an entry from the table above to load the Reference spectrum here.
        </v-alert>
      </v-col>
    </v-row>
  </dialog-page>
</template>

<script>
// TODO: dedupe with PeptideDetails.vue
import 'devextreme/data/odata/store'
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow, DxColumnChooser } from 'devextreme-vue/data-grid'

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
    proteinId () {
      return parseInt(this.$route.params.proteinId)
    },
    /** @returns {number} */
    peptideId () {
      return parseInt(this.$route.params.peptideId)
    }
  },
  mounted () {
    this.setData()
  },
  methods: {
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
          key: 'REFERENCE_IDENTIFICATION_ID',
          url: this.$store.state.host + '/proteomicsdb/logic/referencePeptideDetails.xsodata/REFERENCE_PEPTIDES_VIEW/',
          onLoaded: (oData) => {
            if (oData.length > 0 && this.peptideSequence === '') {
              this.peptideSequence = oData[0].SEQUENCE
            }

            this.tableLoading = false
          }
        },
        reshapeOnPush: true,
        filter: [
          ['PROTEIN_ID', '=', this.proteinId],
          'and',
          ['PEPTIDE_ID', '=', this.peptideId]

        ]
      }
    }
  }
}
</script>

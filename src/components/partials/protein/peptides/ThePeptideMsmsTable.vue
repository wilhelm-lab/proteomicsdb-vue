<template>
  <DxDataGrid
    ref="dataGrid"
    :data-source="dataSource"
    :show-borders="true"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :column-auto-width="true"
    :hover-state-enabled="true"
    :scrolling="{ useNative: true }"
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
      caption="Sequence"
      data-field="PEPTIDE.SEQUENCE"
      cell-template="sequenceTemplate"
    />
    <template #sequenceTemplate="{ data }">
      <router-link :to="getPeptideRoute(data.data.PEPTIDE.PEPTIDE_ID)">
        {{ data.data.PEPTIDE.SEQUENCE }}
      </router-link>
    </template>
    <DxColumn
      caption="Plain Sequence"
      data-field="PEPTIDE.PLAIN_SEQUENCE"
      column-hiding-enabled="true"
    />
    <DxColumn
      caption="ProteomicsDB Score"
      data-field="PEPTIDE.MAX_PRDB_SCORE"
      alignment="left"
    />
    <DxColumn
      caption="-log q-value"
      data-field="PEPTIDE.MAX_LOG_Q_VALUE"
      alignment="left"
    />
    <DxColumn
      caption="Uniqueness"
      data-field="PEPTIDE.UNIQUENESS"
      alignment="left"
    />
    <DxColumn
      caption="Start"
      data-field="PEPTIDE.START_POSITION"
      alignment="left"
    />
    <DxColumn
      caption="Stop"
      data-field="PEPTIDE.END_POSITION"
      alignment="left"
    />
    <DxColumn
      caption="Protease"
      data-field="PEPTIDE.PROTEASE_NAME"
      alignment="left"
    />
    <DxColumn
      caption="Length"
      data-field="PEPTIDE.LENGTH"
      alignment="left"
    />
    <DxColumn
      caption="Missed cleavages"
      data-field="PEPTIDE.MISSED_CLEAVAGES"
      alignment="left"
    />
    <DxColumn
      caption="Mass [Da]"
      data-field="PEPTIDE.MASS"
      alignment="left"
    />
    <DxColumn
      caption="PSMs"
      data-field="PEPTIDE.PSMS"
      alignment="left"
    />
    <DxColumn
      caption="Experiments"
      data-field="PEPTIDE.EXPERIMENTS"
      alignment="left"
    />
    <DxColumn
      caption="Projects"
      data-field="PEPTIDE.PROJECTS"
      alignment="left"
    />
    <DxColumn
      caption="Proteotypicity"
      data-field="PEPTIDE.PROTEOTYPICITY"
      alignment="left"
    />
    <DxColumn
      caption="Reference Spectra"
      data-field="PEPTIDE.REFERENCE_SPECTRA"
      alignment="left"
    />
    <DxPaging :page-size="10" />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[10, 25, 50]"
    />
  </DxDataGrid>
</template>

<script>
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow, DxColumnChooser } from 'devextreme-vue/data-grid'

import downloadUtils from '../../../../utils/downloadUtils'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxColumnChooser
  },
  props: {
    proteinId: {
      type: String,
      required: true
    },
    proteinAccession: {
      type: String,
      default: ''
    },
    dataSource: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onExporting () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinAccession}_peptides_msms.csv`,
        this.$refs.dataGrid
      )
    },
    getPeptideRoute (peptideId) {
      return {
        name: 'proteinPeptidesMSMSDetails',
        params: {
          proteinId: this.proteinId,
          peptideId
        }
      }
    },
    handleRowClick (row) {
      const peptideId = row.data.PEPTIDE.PEPTIDE_ID
      this.$router.push(this.getPeptideRoute(peptideId))
    }
  }
}
</script>

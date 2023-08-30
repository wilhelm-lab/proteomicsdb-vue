<template>
  <DxDataGrid
    ref="dataGrid"
    :data-source="dataSource"
    :show-borders="true"
    :column-auto-width="true"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :selection="{ mode: 'single' }"
    :hover-state-enabled="true"
    :scrolling="{ useNative: true }"
    @rowClick="handleRowClick"
  >
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
      caption="Mascot Score"
      data-field="PEPTIDE.MAX_MASCOT_SCORE"
      alignment="left"
    />
    <DxColumn
      caption="Andromeda Score"
      data-field="PEPTIDE.MAX_ANDROMEDA_SCORE"
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
    <DxPaging :page-size="10" />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[10, 25, 50]"
    />
  </DxDataGrid>
</template>

<script>
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow } from 'devextreme-vue/data-grid'

import downloadUtils from '../../../../utils/downloadUtils'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow
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
        `${this.proteinAccession}_reference_peptides`,
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

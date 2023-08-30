<template>
  <DxDataGrid
    ref="dataGrid"
    :data-source="dataSource"
    :show-borders="true"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :column-auto-width="true"
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
      data-field="SEQUENCE"
    />
    <DxColumn
      caption="Rank Order"
      data-field="RANK_ORDER"
      column-hiding-enabled="true"
    />
    <DxColumn
      caption="# PSMs"
      data-field="PSMS"
    />
    <DxColumn
      caption="# Occurrences"
      data-field="OCCURRENCE"
    />
    <DxColumn
      caption="Proteotypicity"
      data-field="PROTEOTYPICITY"
    />
    <DxColumn
      caption="Cumulative Proteotypicity"
      data-field="CUM_PROTEOTYPICITY"
    />
    <DxColumn
      caption="Uniqueness"
      data-field="UNIQUENESS"
    />
    <DxPaging :page-size="10" />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[10, 25, 50]"
    />
  </DxDataGrid>
</template>

<script>
import 'devextreme/data/odata/store'
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
      default: '51261'
    },
    proteinAccession: {
      type: String,
      default: ''
    },
    labelTypes: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    dataSource: {}
  }),
  watch: {
    labelTypes () {
      this.setData()
    }
  },
  methods: {
    stopLoading () {
      this.$refs.dataGrid.instance.endCustomLoading()
      this.$emit('dataLoaded', null)
    },
    onExporting () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinAccession}_proteotypicity.csv`,
        this.$refs.dataGrid
      )
    },
    handleRowClick (row) {
      const peptideId = row.data.PEPTIDE_ID
      this.$emit('selectedPeptideId', { peptideId })
    },
    setData () {
      this.$refs.dataGrid.instance.beginCustomLoading()
      this.dataSource = {
        store: {
          type: 'odata',
          url: this.$store.state.host + '/proteomicsdb/logic/proteotypicity.xsodata/InputParams(LABEL_TYPES_IN=\'' + this.labelTypes + '\',METHOD_IN=2,PROTEIN_ID_IN=' + this.proteinId + ')/Results',
          onLoaded: () => {
            this.stopLoading()
          }
        },
        reshapeOnPush: true,
        sort: [{ selector: 'RANK_ORDER', desc: false }]
      }
    }
  }
}
</script>

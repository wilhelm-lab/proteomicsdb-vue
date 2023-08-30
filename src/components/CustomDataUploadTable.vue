<template>
  <v-container
    fluid
  >
    <DxDataGrid
      ref="CustomDataUploadTable"
      :data-source="dataSource"
      :show-borders="true"
      :repaint-changes-only="false"
      :allow-column-resizing="true"
      column-resizing-mode="widget"
      :column-auto-width="false"
      :selection="{ mode: 'single' }"
      :hover-state-enabled="true"
      :no-data-text="noDataText"
    >
      <DxExport :enabled="true" />
      <DxFilterRow
        :visible="true"
        :apply-filter="currentFilter"
      />
      <DxColumn
        caption="GeneName"
        data-field="GENE_NAME"
      />
      <DxColumn
        caption="Tissue"
        data-field="TISSUE_ID"
      />
      <DxColumn
        caption="Sample"
        data-field="SAMPLE_ID"
      />
      <DxColumn
        caption="Expression"
        data-field="EXPRESSION"
      />
      <DxColumn
        caption="Quantification Method"
        data-field="QUANTIFICATION_METHOD"
      />
      <DxColumn
        caption="Calculation Method"
        data-field="CALCULATION_METHOD"
      />
      <DxColumn
        caption="Taxcode"
        data-field="TAXCODE"
      />
      <!-- TODO: format data -->

      <DxPaging :page-size="10" />
      <DxPager
        :show-page-size-selector="true"
        :allowed-page-sizes="[10, 25, 50]"
      />-->
    </DxDataGrid>
  </v-container>
</template>

<script>
import {
  DxColumn,
  DxDataGrid, DxExport, DxFilterRow,
  DxPager,
  DxPaging
} from 'devextreme-vue/data-grid'
import 'devextreme/data/odata/store'

export default {
  name: 'CustomDataUploadTable',
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxExport
  },
  props: {
    uuid: {
      type: String,
      default: ''
    },
    datasetId: {
      type: Number,
      default: -1
    }
  },
  data: () => ({
    currentFilter: ''
  }),
  computed: {
    /** @returns {string} */
    noDataText: function () {
      return 'No data found'
    },
    /**
      * @typedef {import('devextreme/data/odata/store').ODataStoreOptions} ODataStoreOptions
      * @returns {ODataStoreOptions}
      */
    dataSource: function () {
      const url = this.$store.state.host + '/proteomicsdb/logic/customUserDataSet.xsodata'
      if ((this.uuid.length === 0) || (this.datasetId < 0)) {
        return {}
      }
      return {
        store: {
          type: 'odata',
          url:
                url + "/InputParams(UUID_IN='" +
                this.uuid +
                "'" +
                ',DATASET_ID_IN=' +
                this.datasetId +
                ')/Results'
        },
        reshapeOnPush: true,
        select: [
          'GENE_NAME',
          'TISSUE_ID',
          'SAMPLE_ID',
          'QUANTIFICATION_METHOD',
          'CALCULATION_METHOD',
          'TAXCODE',
          'EXPRESSION'
        ],
        sort: [{ selector: 'GENE_NAME', desc: true }]
      }
    }
  }
}
</script>

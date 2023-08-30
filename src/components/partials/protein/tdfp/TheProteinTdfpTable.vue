<template>
  <DxDataGrid
    :ref="dataGridRefName"
    :data-source="dataIn"
    :show-borders="true"
    :repaint-changes-only="false"
    :column-auto-width="true"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :allow-column-reordering="true"
    :selection="{ mode: 'multiple', showCheckBoxesMode: 'always', allowSelectAll: false }"
    :column-chooser="{ mode: 'select', height: 400 }"
    :scrolling="{ useNative: true }"
    @selection-changed="onSelectionChanged"
  >
    <DxFilterRow :visible="true" />
    <DxHeaderFilter
      :visible="true"
      :allow-search="true"
      :width="300"
    />
    <DxColumn
      caption="Curve ID"
      data-field="CURVE_ID"
      :visible="false"
      data-type="number"
    /><!-- For Debugging -->

    <DxColumn
      :width="100"
      caption="Drug Name"
      :allow-sorting="true"
      :allow-filtering="true"
      :calculate-cell-value="
        (d) =>
          d.DRUG_NAME.includes('-') //That means the drug has a technical name, so put all letters in uppercase
            ? d.DRUG_NAME.toUpperCase()
            : d.DRUG_NAME[0].toUpperCase() + d.DRUG_NAME.slice(1).toLowerCase()
      "
      data-type="string"
    />
    <DxColumn
      :width="100"
      caption="Cell Line"
      data-field="CELLLINE_NAME"
      data-type="string"
    />
    <DxColumn
      :width="100"
      caption="Dose"
      data-type="string"
      :allow-sorting="true"
      :allow-filtering="true"
      :calculate-cell-value="createDoseString"
    />
    <DxColumn
      :width="200"
      caption="Experiment"
      data-field="EXPERIMENT_NAME"
      data-type="string"
    />
    <DxPaging :page-size="10" />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[5, 10, 25]"
    />
  </DxDataGrid>
</template>

<script>
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager,
  DxFilterRow,
  DxHeaderFilter
} from 'devextreme-vue/data-grid'

import downloadUtils from '../../../../utils/downloadUtils'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxHeaderFilter
  },
  props: {
    dataGridRefName: {
      type: String,
      default: 'assayGrid'
    },
    dataIn: {
      type: Array,
      default: () => []
    },
    proteinAccession: {
      type: String,
      default: ''
    },
    toggleColumnChooser: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    toggleColumnChooser () {
      const dataGrid = this.$refs[this.dataGridRefName].instance
      dataGrid.showColumnChooser()
    }
  },
  methods: {
    createDoseString: function (data) {
      return `${data.SECOND_DIMENSION_VALUE} ${data.SECOND_DIMENSION_UNIT}`
    },
    onSelectionChanged ({ selectedRowsData }) {
      this.$emit('selected-rows-changed', selectedRowsData)
    },
    onExporting () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinAccession}_td_proteins.csv`,
        this.$refs[this.dataGridRefName]
      )
    }
  }
}
</script>

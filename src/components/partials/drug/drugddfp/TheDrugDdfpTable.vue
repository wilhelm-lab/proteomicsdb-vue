<template>
  <DxDataGrid
    :ref="dataGridRefName"
    :data-source="dataSource"
    :show-borders="true"
    :repaint-changes-only="false"
    :column-auto-width="true"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :allow-column-reordering="true"
    :selection="{ mode: 'multiple', showCheckBoxesMode: 'always', allowSelectAll: false }"
    :column-chooser="{ mode: 'select', height: 400 }"
    :scrolling="{ useNative: true }"
    @initialized="saveGridInstance"
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
      data-type="number"
      :visible="false"
      alignment="left"
    /><!-- For Debugging -->
    <DxColumn
      :width="100"
      caption="Regulation"
      data-field="REGULATION"
      data-type="string"
      cell-template="regulationTemplate"
    />
    <template #regulationTemplate="{ data }">
      <v-icon
        v-if="data.value == 'up'"
        color="#ea0000"
      >
        mdi-arrow-up-bold
      </v-icon>
      <v-icon
        v-else-if="data.value == 'down'"
        color="#252bff"
      >
        mdi-arrow-down-bold
      </v-icon>
      <v-icon
        v-else-if="data.value == '-'"
        color="#000000"
      >
        mdi-minus
      </v-icon>
    </template>
    <DxColumn
      caption="Gene Name"
      data-field="GENE_NAME"
      data-type="string"
    />
    <DxColumn
      width="300"
      caption="Protein Name"
      data-field="PROTEIN_NAME"
      data-type="string"
    />
    <DxColumn
      width="100"
      caption="Uniprot"
      data-type="string"
      data-field="UNIPROT_ACC"
      cell-template="proteinLinkTemplate"
    />
    <template #proteinLinkTemplate="{ data }">
      <div>
        <div
          v-for="uniprot in data.value.split(',')"
          :key="uniprot"
          style="display:inline;"
        >
          <a
            :href="createUniProtLink(uniprot)"
            target="_blank"
          >{{
            uniprot
          }}</a>,
        </div>
      </div>
    </template>
    <DxColumn
      :width="100"
      caption="Cell Line"
      data-field="CELLLINE_NAME"
      data-type="string"
    />
    <DxColumn
      :width="100"
      caption="Duration"
      data-type="string"
      :allow-sorting="true"
      :allow-filtering="true"
      :calculate-cell-value="createDurationString"
      alignment="left"
    />
    <DxColumn
      :width="100"
      alignment="left"
      caption="-Log10(EC50)"
      data-field="LOG_IC50"
      selected-filter-operation="<="
      data-type="number"
      :allow-header-filtering="false"
    >
      <DxFormat
        type="fixedPoint"
        :precision="2"
      />
    </DxColumn>
    <DxColumn
      :width="100"
      alignment="left"
      caption="Fold Change"
      data-field="FOLD_CHANGE"
      selected-filter-operation=">="
      data-type="number"
      :allow-header-filtering="false"
    >
      <DxFormat
        type="fixedPoint"
        :precision="2"
      />
    </DxColumn>
    <DxColumn
      :width="100"
      alignment="left"
      caption="R²"
      data-field="R2"
      selected-filter-operation=">="
      data-type="number"
      :allow-header-filtering="false"
    >
      <DxFormat
        type="fixedPoint"
        :precision="2"
      />
    </DxColumn>
    <DxColumn
      :width="100"
      alignment="left"
      caption="AUC"
      data-field="AUC"
      selected-filter-operation=">="
      data-type="number"
      :allow-header-filtering="false"
    >
      <DxFormat
        type="fixedPoint"
        :precision="2"
      />
    </DxColumn>
    <!--    <DxColumn-->
    <!--      caption="-Log10(p-Value)"-->
    <!--      data-field="LOG_P_VALUE"-->
    <!--    data-type="number"-->
    <!--      selected-filter-operation=">="-->
    <!--    >-->
    <!--      <DxFormat-->
    <!--        type="fixedPoint"-->
    <!--        :precision="2"-->
    <!--      />-->
    <!--    </DxColumn>-->
    <DxColumn
      :width="200"
      caption="Experiment"
      data-field="EXPERIMENT_NAME"
      data-type="string"
    />
    <DxPaging :page-size="10" />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[10, 25, 50]"
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
  DxFormat,
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
    DxFormat,
    DxHeaderFilter
  },
  props: {
    dataGridRefName: {
      type: String,
      default: 'assayGrid'
    },
    dataSource: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    toggleColumnChooser: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    dataGridInstance: null
  }),
  watch: {
    isLoading: function (newValue) {
      if (this.dataGridInstance) {
        if (newValue) {
          this.dataGridInstance.beginCustomLoading()
        } else {
          this.dataGridInstance.endCustomLoading()
        }
      }
    },
    toggleColumnChooser () {
      const dataGrid = this.$refs[this.dataGridRefName].instance
      dataGrid.showColumnChooser()
    }
  },
  methods: {
    saveGridInstance: function (e) {
      this.dataGridInstance = e.component
    },
    createDurationString: function (data) {
      const duration = data.SECOND_DIMENSION_VALUE
      const timeUnit = data.SECOND_DIMENSION_UNIT
      if (duration < 1 && timeUnit === 'h') {
        return `${(duration * 60).toPrecision(2)} min`
      } else {
        return `${duration} ${timeUnit}`
      }
    },
    createUniProtLink: function (accId) {
      return accId.includes('-')
        ? 'https://www.uniprot.org/uniprot/' + accId.split('-')[0] + '#' + accId
        : 'https://www.uniprot.org/uniprot/' + accId
    },
    onSelectionChanged ({ selectedRowsData }) {
      this.$emit('selected-rows-changed', selectedRowsData)
    },
    onExporting (drugName) {
      downloadUtils.downloadDxDataGridCSV(
        `${drugName}_ddProteins.csv`,
        this.$refs[this.dataGridRefName]
      )
    }
  }
}
</script>

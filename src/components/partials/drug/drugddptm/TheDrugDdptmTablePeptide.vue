<template>
  <!-- @ts-nocheck -->
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
      :width="250"
      caption="Modified Sequence"
      data-type="string"
      data-field="SEQUENCE"
    />
    <DxColumn
      :width="150"
      caption="Modification Type"
      data-type="string"
      data-field="MODIFICATION_TYPE"
    />
    <DxColumn
      :width="150"
      caption="PhosphoSitePlus®"
      :calculate-cell-value="generatePSPTuples"
      cell-template="pspTemplate"
      data-type="string"
      :allow-sorting="true"
      :allow-filtering="true"
      :calculate-sort-value="calculatePhosphoSortValue"
      :calculate-filter-expression="calculatePhosphoFilterExpression"
      data-field="MOD_RSD"
    >
      <DxHeaderFilter
        :data-source="pspHeaderFilterData"
      />
    </DxColumn>
    <template
      #pspTemplate="{
        data
      }"
    >
      <div style="display: flex">
        <div
          v-for="[i, psite] of data.value.entries() /* TODO: Workaround because Vetur gives `unknown` type for `x` in v-for `(x, i) in` syntax */"
          :key="psite.ACC_ID + '-' + psite.MOD_RSD + '-' + i + '-div'"
        >
          <v-tooltip
            v-for="(psiteiso, j) in psite.MOD_RSD.split(';')"
            :key="psite.ACC_ID + '-' + psite.MOD_RSD + '-' + i + '-chip-' + j"
            bottom
          >
            <template #activator="{ on, attrs }">
              <v-chip
                link
                small
                class="psiteChip"
                :color="
                  psite.LT_LIT > 0
                    ? 'light-green'
                    : psite.HT_LIT > 0
                      ? 'orange lighten-2'
                      : 'red lighten-4'
                "
                v-bind="attrs"
                v-on="on"
              >
                <a
                  :href="createPSPLink(psite.ACC_ID)"
                  target="_blank"
                >{{
                  psiteiso
                }}</a>
              </v-chip>
            </template>
            <span>UniprotID: {{ psite.ACC_ID }}<br>
              Low-Throughput References: {{ psite.LT_LIT }}<br>
              High-Throughput References:: {{ psite.HT_LIT }}</span>
          </v-tooltip>
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
      caption="Combination Treatment"
      data-field="COMBINATION_TREATMENT"
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
      sort-order="desc"
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

<script lang="ts">
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
  computed: {
    /** @returns {{ text: string, value: string }[]} */
    pspHeaderFilterData () {
      const pspSet = [...new Set(this.dataSource.filter(d => d.MOD_RSD).map(d => d.MOD_RSD.split('|')).flat())]
      const result = pspSet.map(psp => { return { text: psp, value: psp } })
      return result
    }
  },
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
    unselectAllRows () {
      this.$refs[this.dataGridRefName].instance.deselectAll()
    },
    onExporting (drugName) {
      downloadUtils.downloadDxDataGridCSV(
        drugName + '_ddPTM.csv',
        this.$refs[this.dataGridRefName],
        {
          MOD_RSD: (data) => data.MOD_RSD
        }
      )
    },
    /** @returns {{ LT_LIT: string, HT_LIT: string, MOD_RSD: string, ACC_ID: string }[]} */
    generatePSPTuples (rowData) {
      if (rowData.ACC_ID) {
        // Turn the concatenated entries into individual objects
        const accIds = rowData.ACC_ID.split('|')
        const ltLits = rowData.LT_LIT.split('|')
        const htLits = rowData.HT_LIT.split('|')
        const modRsds = rowData.MOD_RSD.split('|')

        const result = [...new Set(
          // Make it a unique list by stringifying them, turning the strings into a set, and parsing them back
          accIds.map(function (accId, i) {
            return JSON.stringify({
              LT_LIT: ltLits[i],
              HT_LIT: htLits[i],
              MOD_RSD: modRsds[i],
              ACC_ID: accId
            })
          }))]
          .map((s) => JSON.parse(`${s}`))
        // Sort and return
          .sort((a, b) =>
            (a.LT_LIT < b.LT_LIT)
              ? 1
              : ((a.LT_LIT === b.LT_LIT)
                  ? ((a.HT_LIT < b.HT_LIT)
                      ? 1
                      : -1)
                  : -1)
          )

        return result
      } else {
        return []
      }
    },
    createPSPLink: function (accId) {
      return 'http://www.phosphosite.org/uniprotAccAction?id=' + accId
    },
    calculatePhosphoSortValue: function (rowData) {
      // MOD_RSD contains a ;-separated list of p-sites, each looking like this: Y123-p
      // Extract the position from each p-site and return the smallest of those
      return rowData.MOD_RSD
        ? Math.min(...rowData.MOD_RSD.split(';')
          .map(s => s.substring(1).split('-')[0]))
        : Number.MAX_VALUE
    },
    calculatePhosphoFilterExpression: function (filterValue, selectedFilterOperation, target) {
      // We are searching in an array, so the header filter will not work - it would compare strings to arrays
      // Therefore, if the target of the filter is the header, we convert the '=' into a 'contains' filter
      if (target === 'headerFilter' && selectedFilterOperation === '=') {
        selectedFilterOperation = 'contains'
      }
      // The filter expression is a triple: The first value is a callback that generates the data source from the row,
      // the second is the filter Operation (e.g. 'contains') and the third is the value to filter by
      return [
        (rowData) => {
          return rowData.MOD_RSD ? rowData.MOD_RSD.split('|') : ''
        },
        selectedFilterOperation,
        filterValue
      ]
    }
  }
}
</script>

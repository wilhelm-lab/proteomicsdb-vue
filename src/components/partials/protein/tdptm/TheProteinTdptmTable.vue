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
      :width="250"
      caption="Modified Sequence"
      data-field="MOD_SEQUENCE"
      data-type="string"
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
      alignment="left"
    >
      <DxHeaderFilter
        :data-source="pspHeaderFilterData"
      />
    </DxColumn>
    <template #pspTemplate="{ data }">
      <div style="display: flex">
        <div
          v-for="[i, psite] in data.value.entries() /* TODO: Workaround because Vetur gives `unknown` type for `x` in v-for `(x, i) in` syntax */"
          :key="psite.ACC_ID + '-' + psite.MOD_RSD + '-' + i + '-div'"
        >
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-chip
                link
                small
                class="dataChip"
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
                  psite.MOD_RSD
                }}</a>
              </v-chip>
            </template>
            <span>UniprotID: {{ data.data.ACC_ID }}<br>
              Low-Throughput References: {{ data.data.LT_LIT }}<br>
              High-Throughput References: {{ data.data.HT_LIT }}</span>
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

    <!--    Why would we need the Uniprot column in this view? It's a constant-->
    <!--    <DxColumn-->
    <!--      :width="100"-->
    <!--      caption="Uniprot"-->
    <!--      data-field="UNIPROT_ACC"-->
    <!--    />-->
    <DxColumn
      :width="100"
      caption="Drug Name"
      :allow-sorting="true"
      :allow-filtering="true"
      data-field="DRUG_NAME"
      data-type="string"
    />
    <DxColumn
      :width="100"
      caption="Combination Treatment"
      data-field="COMBINATION_TREATMENT"
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
  computed: {
    /** @returns {{ text: string, value: string }[]} */
    pspHeaderFilterData: function () {
      const pspSet = [...new Set(this.dataIn.map(d => d.MOD_RSD.split('|')).flat())]
      return pspSet.map(psp => { return { text: psp, value: psp } })
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
        this.proteinAccession + '_tdPTM.csv',
        this.$refs[this.dataGridRefName],
        {
          MOD_RSD: (data) => data.MOD_RSD
        }
      )
    },
    generatePSPTuples: function (rowData) {
      if (rowData.ACC_ID) {
        // Turn the concatenated entries into individual objects
        const accIds = rowData.ACC_ID.split('|')
        const ltLits = rowData.LT_LIT.split('|')
        const htLits = rowData.HT_LIT.split('|')
        const modRsds = rowData.MOD_RSD.split('|')

        return [...new Set(
          // Make it a unique list by stringifying them, turning the strings into a set, and parsing them back
          accIds.map(function (accId, i) {
            return JSON.stringify({
              LT_LIT: ltLits[i],
              HT_LIT: htLits[i],
              MOD_RSD: modRsds[i],
              ACC_ID: accId
            })
          }))]
          .map((s) => JSON.parse(s))
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
          return rowData.MOD_RSD.split('|')
        },
        selectedFilterOperation,
        filterValue
      ]
    }
  }
}
</script>

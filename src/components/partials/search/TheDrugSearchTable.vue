<template>
  <v-container>
    <v-row
      justify="center"
      class="mt-8"
    >
      <v-col
        lg="10"
      >
        <h1
          v-if="$route.query.q"
          class="font-weight-regular"
        >
          <strong>Drug</strong> search results for "{{ $route.query.q }}"
        </h1>
        <DxDataGrid
          ref="dataGrid"
          :data-source="dataSource"
          :show-borders="true"
          :repaint-changes-only="false"
          :allow-column-resizing="true"
          column-resizing-mode="widget"
          :column-auto-width="true"
          :scrolling="{ useNative: true }"
          :selection="{ mode: 'single' }"
          :hover-state-enabled="true"
          :no-data-text="noDataText"
          @rowClick="onSelectionChanged"
          @exporting="onExporting"
        >
          <DxExport :enabled="true" />
          <DxFilterRow
            :visible="true"
            :apply-filter="currentFilter"
          />
          <DxColumn
            caption="Name"
            data-field="DRUG_NAME"
            cell-template="drug-name-cell"
          />
          <template #drug-name-cell="{ data }">
            <div style="font-weight: bold">
              {{ data.value }}
            </div>
          </template>
          <DxColumn
            caption="Type"
            data-field="DRUG_TYPE"
          />
          <!--      Smiles could e.g. be visualized with https://github.com/reymond-group/smilesDrawer
      But there are not many Smiles...-->
          <DxColumn
            caption="Smiles"
            data-field="SMILES"
            :width="300"
          />
          <DxColumn
            caption="Inchi"
            data-field="INCHI"
            :width="350"
          />

          <DxPaging :page-size="10" />
          <DxPager
            :show-page-size-selector="true"
            :allowed-page-sizes="[10, 25, 50]"
          />
        </DxDataGrid>
        <v-col />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import 'devextreme/data/odata/store'
import {
  DxExport,
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager,
  DxFilterRow
} from 'devextreme-vue/data-grid'

import downloadUtils from '../../../utils/downloadUtils'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxExport
  },
  props: {
    searchString: {
      type: String,
      default: ''
    },
    taxcode: {
      type: [String, Number],
      default: 9606
    },
    projectId: {
      type: Number,
      default: -1
    }
  },
  data: () => ({
    currentFilter: null
  }),
  computed: {
    /** @returns {string} */
    noDataText: function () {
      return this.searchString && this.searchString !== 'null'
        ? 'No drugs found'
        : "Enter a Drug name above and hit 'Enter' to start your search."
    },
    /**
      * @typedef {import('devextreme/data/odata/store').ODataStoreOptions} ODataStoreOptions
      * @returns {ODataStoreOptions}
      */
    dataSource: function () {
      return {
        store: {
          type: 'odata',
          url:
                `${this.$store.state.host}/proteomicsdb/logic/drugSearchEndpoint.xsodata/InputParams(` +
                `SEARCH_STR='${this.searchString}',PROJECT_ID=${this.projectId}` +
                ')/Results'
        },
        reshapeOnPush: true,
        select: [
          'DRUG_ID',
          'DRUG_NAME',
          'DRUG_TYPE',
          'SMILES',
          'INCHI',
          'CHEMBL_ID'
        ],
        sort: [{ selector: 'DRUG_NAME', desc: true }]
      }
    }
  },
  methods: {
    onExporting (event) {
      downloadUtils.downloadDxDataGridCSV(
        `drug_search ${this.searchString}`,
        this.$refs.dataGrid
      )

      event.cancel = true
    },
    onSelectionChanged: function (row) {
      // Todo: This does not redirect to the target tab yet
      this.$router.push({
        name: 'drugSummary',
        params: {
          drugId: `${row.data.DRUG_ID}`,
          chemblId: row.data.CHEMBL_ID,
          drugName: row.data.DRUG_NAME
        }
      })
    }
  }
}
</script>

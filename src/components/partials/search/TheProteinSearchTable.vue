<template>
  <v-container>
    <v-row
      justify="center"
      class="mt-8"
    >
      <v-col lg="12">
        <h1 class="font-weight-regular">
          <strong>Protein</strong> search results for "{{
            $route.query.q
          }}"
        </h1>

        <DxDataGrid
          ref="dataGrid"
          :data-source="dataSource"
          :show-borders="true"
          :allow-column-resizing="true"
          column-resizing-mode="widget"
          :column-auto-width="true"
          :scrolling="{ useNative: true }"
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
            :width="30"
            caption=""
            :allow-filtering="false"
            :allow-sorting="false"
            data-field="EVIDENCE"
            cell-template="cellTemplate"
          />
          <DxColumn
            caption="Gene Name"
            data-field="PROTEIN"
            cell-template="protein-name-cell"
          />
          <template #protein-name-cell="{ data }">
            <div style="font-weight: bold">
              {{ data.value }}
            </div>
          </template>
          <!--      <DxColumn data-field='EVIDENCE'/> -->
          <!--          <DxColumn-->
          <!--            caption="Uniprot Accession"-->
          <!--            data-field="UNIPROT_AC"-->
          <!--          />-->
          <DxColumn
            caption="Isoform ID"
            data-field="UNIPROT_ID"
          />
          <DxColumn
            caption="Database"
            data-field="DATABASE_NAME"
          />
          <DxColumn
            caption="Description"
            data-field="DESCRIPTION"
            :width="250"
          />
          <DxColumn
            caption="Length"
            data-field="SEQUENCE_LENGTH"
          />
          <DxColumn
            caption="Unique Peptides"
            data-field="DISTINCT_UNIQUE_PEPTIDES"
          />
          <!--          <DxColumn-->
          <!--            caption="Unique Peptides (Protein)"-->
          <!--            data-field="DISTINCT_UNIQUE_PEPTIDES_PROTEIN"-->
          <!--          />-->
          <DxColumn
            caption="Unique PSMS"
            data-field="UNIQUE_PSMS"
          />
          <DxColumn
            caption="Shared PSMS"
            data-field="SHARED_PSMS"
          />
          <DxColumn
            caption="Sequence Coverage"
            data-field="COVERAGE_ALL"
            data-type="number"
          >
            <DxFormat
              type="fixedPoint"
              :precision="2"
            />
          </DxColumn>
          <DxColumn
            caption="Projects"
            data-field="NUMBER_OF_PROJECTS"
          />
          <DxColumn
            caption="Experiments"
            data-field="NUMBER_OF_EXPERIMENTS"
          />
          <DxColumn
            caption="Reference Spectra"
            data-field="REFERENCE_SPECTRA"
          />
          <template #cellTemplate="{ data }">
            <img
              :src="data.value === 2 ? green : data.value === 1 ? yellow : red"
            >
          </template>
          <DxPaging :page-size="10" />
          <DxPager
            :show-page-size-selector="true"
            :allowed-page-sizes="[10, 25, 50]"
          />
        </DxDataGrid>
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
  DxFilterRow,
  DxFormat
} from 'devextreme-vue/data-grid'

import downloadUtils from '../../../utils/downloadUtils'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxExport,
    DxFormat
  },
  props: {
    searchString: {
      type: String,
      default: 'egfr'
    },
    taxcode: {
      type: [String, Number],
      default: 9606
    },
    targetTab: {
      type: String,
      default: 'proteinSummary'
    }
  },
  data: () => ({
    currentFilter: null,
    green: require('@/assets/commons/green.png'),
    yellow: require('@/assets/commons/yellow.png'),
    red: require('@/assets/commons/red.png')
  }),
  computed: {
    /** @returns {string} */
    noDataText: function () {
      return this.searchString && this.searchString !== 'null'
        ? 'No proteins found'
        : "Enter a Protein name, Gene name, or Uniprot ID above and hit 'Enter' to start your search."
    },
    /**
      * @typedef {import('devextreme/data/odata/store').ODataStoreOptions} ODataStoreOptions
      * @returns {ODataStoreOptions}
      */
    dataSource: function () {
      return this.searchString && this.searchString !== 'null'
        ? {
            store: {
              type: 'odata',
              url:
                this.$store.state.host +
                "/proteomicsdb/logic/proteinSearchEndpoint.xsodata/InputParams(PROTEIN_NAME='" +
                this.searchString +
                "'" +
                ',TAXCODE_IN=' +
                this.taxcode +
                ')/Results'
            },
            reshapeOnPush: true,
            select: [
              'PROTEIN_ID',
              'PROTEIN',
              'EVIDENCE',
              'UNIPROT_AC',
              'UNIPROT_ID',
              'DATABASE_NAME',
              'DESCRIPTION',
              'SEQUENCE_LENGTH',
              'MASS',
              'DISTINCT_UNIQUE_PEPTIDES_PROTEIN',
              'DISTINCT_UNIQUE_PEPTIDES',
              // 'ORGANISM_LONGTEXT',
              'ORGANISM',
              'UNIQUE_PSMS',
              'SHARED_PSMS',
              // 'TOTAL_PSMS',
              'COVERAGE_ALL',
              'NUMBER_OF_PROJECTS',
              'NUMBER_OF_EXPERIMENTS',
              'REFERENCE_SPECTRA'
            ],
            sort: [{ selector: 'NUMBER_OF_PROJECTS', desc: true }]
          }
        : undefined
    }
  },
  methods: {
    onExporting (e) {
      downloadUtils.downloadDxDataGridCSV(
        `Protein Search Results - ${this.searchString}`,
        this.$refs.dataGrid,
        {},
        {
          EVIDENCE: () => 'Evidence'
        }
      )

      e.cancel = true
    },
    onSelectionChanged: function (row) {
      this.$router.push({
        name: this.targetTab,
        params: { proteinId: row.data.PROTEIN_ID }
      })
    }
  }
}
</script>

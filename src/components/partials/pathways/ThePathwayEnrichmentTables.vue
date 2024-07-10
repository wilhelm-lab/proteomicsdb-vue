<template>
  <div>
    <v-tabs
      v-model="peaVsKaiTab"
      height="70"
      background-color="primary"
      dark
      fixed-tabs
    >
      <v-tab
        key="pea"
        class="enrichment-tab"
        href="#pea"
        style="font-size: 12pt"
      >
        Pathway Enrichment
      </v-tab>
      <v-tab
        key="kea"
        class="enrichment-tab"
        href="#kea"
        style="font-size: 12pt"
      >
        Kinase Activity Inference
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="peaVsKaiTab">
      <v-tab-item value="pea">
        <v-tabs
          v-model="pathwayEnrichmentTab"
          fixed-tabs
          dark
        >
          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="ptmsea"
                class="enrichment-tab"
                href="#ptmsea"
                v-on="on"
              >
                PTM-SEA
              </v-tab>
            </template>
            <span>PTM-Centric Enrichment Analysis using the PTM Signature Database (PTMSigDB).<br>
              Basically a GSEA that is Single-Site-Centric (ssc).</span>
          </v-tooltip>
          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="gc"
                class="enrichment-tab"
                href="#gc"
                v-on="on"
              >
                PEA Gene-Centric
              </v-tab>
            </template>
            <span>Gene-Centric Enrichment Analysis using the Molecular Signatures Database (MSigDB).<br>
              PTM data is collapsed to gene level.<br>
              We use the KEGG and WikiPathways signature sets.</span>
          </v-tooltip>
          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="gcr"
                class="enrichment-tab"
                href="#gcr"
                v-on="on"
              >
                PEA Gene-Centric Redundant
              </v-tab>
            </template>
            <span>Gene-Centric-Redundant Enrichment Analysis using the Molecular Signatures Database (MSigDB).<br>
              PTM data is collapsed to gene level.<br>
              We use the KEGG and WikiPathways signature sets.</span>
          </v-tooltip>
        </v-tabs>
        <v-tabs-items
          v-model="pathwayEnrichmentTab"
          class="pt-5"
        >
          <v-tab-item
            value="ptmsea"
          >
            <DxDataGrid
              v-if="dataIn.ptmsea.length > 0"
              :ref="dataGridRefName + '-' + pathwayEnrichmentTab"
              :data-source="dataIn.ptmsea"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.ptmsea[0])"
                :key="key + '_column'"
                :width="250"
                :caption="key"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Signature ID' || key === 'Gene') ? 'string' : 'number'"
                :sort-order="key.startsWith('Score') ? 'desc' : null"
                :allow-sorting="true"
                :allow-filtering="(key === 'Signature ID' || key === 'Gene')"
                :format="{formatter: val => key.startsWith('Overlap') ? val + '%' : val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>
          <v-tab-item
            value="gc"
          >
            <DxDataGrid
              v-if="dataIn.gc.length > 0"
              :ref="dataGridRefName + '-' + pathwayEnrichmentTab"
              :data-source="dataIn.gc"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.gc[0])"
                :key="key + '_column'"
                :width="250"
                :caption="key"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Signature ID' || key === 'Gene') ? 'string' : 'number'"
                :sort-order="key.startsWith('Score') ? 'desc' : null"
                :allow-sorting="true"
                :allow-filtering="(key === 'Signature ID' || key === 'Gene')"
                :format="{formatter: val => key.startsWith('Overlap') ? val + '%' : val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>
          <v-tab-item
            value="gcr"
          >
            <DxDataGrid
              v-if="dataIn.gcr.length > 0"
              :ref="dataGridRefName + '-' + pathwayEnrichmentTab"
              :data-source="dataIn.gcr"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.gcr[0])"
                :key="key + '_column'"
                :width="250"
                :caption="key"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Signature ID' || key === 'Gene') ? 'string' : 'number'"
                :sort-order="key.startsWith('Score') ? 'desc' : null"
                :allow-sorting="true"
                :allow-filtering="(key === 'Signature ID' || key === 'Gene')"
                :format="{formatter: val => key.startsWith('Overlap') ? val + '%' : val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>
        </v-tabs-items>
      </v-tab-item>
      <v-tab-item value="kea">
        <v-tabs
          v-model="kinaseActivityTab"
          dark
        >
          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="ksea"
                class="enrichment-tab"
                href="#ksea"
                v-on="on"
              >
                KSEA
              </v-tab>
            </template>
            <span>Kinase Activity Inference using phosphoproteomic data and prior knowledge on kinase-substrate relationships.<br>
              In KSEA, the mean fold change among the set of substrates of each kinase is compared to an expected value.<br></span>
          </v-tooltip>
          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="ksea_rokai"
                class="enrichment-tab"
                href="#ksea_rokai"
                v-on="on"
              >
                KSEA with RoKAI
              </v-tab>
            </template>
            <span>RoKAI refines phosphorylation profiles using prior knowledge functional networks.<br>
              KSEA is run on the refined profiles afterwards.<br>
              In general, this produces more robust results compared to only running KSEA.</span>
          </v-tooltip>

          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="motif"
                class="enrichment-tab"
                href="#motif"
                v-on="on"
              >
                Motif Enrichment
              </v-tab>
            </template>
            <span>Performs a Kinase Motif Enrichment by utilizing the Kinase Library.<br>
              Position-specific scoring matrices are used to score the motif of each kinase against a phosphoproteomics dataset.</span>
          </v-tooltip>

          <template
            v-if="Object.keys(dataIn.kea3).length > 0"
          >
            <template
              v-for="exp in Object.keys(dataIn.kea3)"
            >
              <v-tooltip
                :key="'kea3-'+exp+'-mean-tooltip'"
                top
                color="#4d4b4d"
              >
                <template #activator="{ on, attrs }">
                  <v-tab
                    v-bind="attrs"
                    :key="'kea3-'+exp+'-mean'"
                    class="enrichment-tab"
                    :href="'#kea3-'+exp+'-mean'"
                    v-on="on"
                  >
                    KEA3 MeanRank ({{ exp }})
                  </v-tab>
                </template>
                <span>Kinase enrichment analysis using the KEA3 algorithm.<br>
                  KEA3 infers upstream kinases whose putative substrates are <br>
                  overrepresented in a user-inputted list of proteins or differentially phosphorylated proteins.</span>
              </v-tooltip>

              <v-tooltip
                :key="'kea3-'+exp+'-top-tooltip'"
                top
                color="#4d4b4d"
              >
                <template #activator="{ on, attrs }">
                  <v-tab
                    v-bind="attrs"
                    :key="'kea3-'+exp+'-top'"
                    class="enrichment-tab"
                    :href="'#kea3-'+exp+'-top'"
                    v-on="on"
                  >
                    KEA3 TopRank ({{ exp }})
                  </v-tab>
                </template>
                <span>Kinase enrichment analysis using the KEA3 algorithm.<br>
                  KEA3 infers upstream kinases whose putative substrates are <br>
                  overrepresented in a user-inputted list of proteins or differentially phosphorylated proteins.</span>
              </v-tooltip>
            </template>
          </template>

          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="kstar-st"
                class="enrichment-tab"
                href="#kstar-st"
                v-on="on"
              >
                KSTAR (ST)
              </v-tab>
            </template>
            <span>Kinase Activity Prediction using the KSTAR algorithm.</span>
          </v-tooltip>
          <v-tooltip
            top
            color="#4d4b4d"
          >
            <template #activator="{ on, attrs }">
              <v-tab
                v-bind="attrs"
                key="kstar-y"
                class="enrichment-tab"
                href="#kstar-y"
                v-on="on"
              >
                KSTAR (Y)
              </v-tab>
            </template>
            <span>Kinase Activity Prediction using the KSTAR algorithm.</span>
          </v-tooltip>
        </v-tabs>
        <v-tabs-items
          v-model="kinaseActivityTab"
          class="pt-5"
        >
          <v-tab-item
            value="ksea"
          >
            <DxDataGrid
              v-if="dataIn.ksea.length > 0"
              :ref="dataGridRefName + '-' + kinaseActivityTab"
              :data-source="dataIn.ksea"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.ksea[0])"
                :key="key + '_column'"
                :width="250"
                :caption="key"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Signature ID' || key === 'Gene') ? 'string' : 'number'"
                :sort-order="key.startsWith('Score') ? 'desc' : null"
                :allow-sorting="true"
                :allow-filtering="(key === 'Signature ID' || key === 'Gene')"
                :format="{formatter: val => key.startsWith('Overlap') ? val + '%' : val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>
          <v-tab-item
            value="ksea_rokai"
          >
            <DxDataGrid
              v-if="dataIn.ksea_rokai.length > 0"
              :ref="dataGridRefName + '-' + kinaseActivityTab"
              :data-source="dataIn.ksea_rokai"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.ksea_rokai[0])"
                :key="key + '_column'"
                :width="250"
                :caption="key"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Signature ID' || key === 'Gene') ? 'string' : 'number'"
                :sort-order="key.startsWith('Score') ? 'desc' : null"
                :allow-sorting="true"
                :allow-filtering="(key === 'Signature ID' || key === 'Gene')"
                :format="{formatter: val => key.startsWith('Overlap') ? val + '%' : val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>

          <v-tab-item
            value="motif"
          >
            <DxDataGrid
              v-if="dataIn.motif.length > 0"
              :ref="dataGridRefName + '-' + kinaseActivityTab"
              :data-source="dataIn.motif"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.motif[0])"
                :key="key + '_column'"
                :width="250"
                :caption="key"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Kinase') ? 'string' : 'number'"
                :sort-order="key.startsWith('-Log10 p_value adjusted') ? 'desc' : null"
                :allow-sorting="true"
                :allow-filtering="(key === 'Kinase')"
                :format="{formatter: val => val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>

          <template
            v-if="Object.keys(dataIn.kea3).length > 0"
          >
            <template
              v-for="exp in Object.keys(dataIn.kea3)"
            >
              <v-tab-item
                :key="exp + '_meantable'"
                :value="'kea3-'+exp+'-mean'"
              >
                <DxDataGrid
                  v-if="dataIn.kea3[exp].MeanRank.length > 0"
                  :ref="dataGridRefName + '-' + kinaseActivityTab + exp + 'MeanRank'"
                  :data-source="dataIn.kea3[exp].MeanRank"
                  :show-borders="true"
                  :repaint-changes-only="false"
                  :column-auto-width="true"
                  :allow-column-resizing="true"
                  column-resizing-mode="widget"
                  :allow-column-reordering="true"
                  :scrolling="{ useNative: true }"
                  @initialized="saveGridInstance"
                  @exporting="onExporting"
                >
                  <DxFilterRow :visible="true" />
                  <DxColumn
                    v-for="key in Object.keys(dataIn.kea3[exp].MeanRank[0]).filter(col => col !== 'Query Name')"
                    :key="key + '_column'"
                    :width="250"
                    :caption="key"
                    :calculate-cell-value="getValue(key)"
                    :calculate-sort-value="getValueAbsolute(key)"
                    alignment="left"
                    :data-type="[ 'TF', 'Library', 'Overlapping_Genes'].includes(key) ? 'string' : 'number'"
                    :sort-order="key === 'Rank' ? 'asc' : null"
                    :allow-sorting="true"
                    :allow-filtering="['TF', 'Library', 'Overlapping_Genes'].includes(key)"
                    :format="{formatter: val => key=== 'Rank' ? val : val.toFixed(2)}"
                  />
                  <DxPaging :page-size="10" />
                  <DxPager
                    :show-page-size-selector="true"
                    :allowed-page-sizes="[5, 10, 25]"
                  />
                </DxDataGrid>
                <TheEnrichmentTablePlaceholder v-else />
              </v-tab-item>

              <v-tab-item
                :key="exp + '_toptable'"
                :value="'kea3-'+exp+'-top'"
              >
                <DxDataGrid
                  v-if="dataIn.kea3[exp].TopRank.length > 0"
                  :ref="dataGridRefName + '-' + kinaseActivityTab + exp + 'TopRank'"
                  :data-source="dataIn.kea3[exp].TopRank"
                  :show-borders="true"
                  :repaint-changes-only="false"
                  :column-auto-width="true"
                  :allow-column-resizing="true"
                  column-resizing-mode="widget"
                  :allow-column-reordering="true"
                  :scrolling="{ useNative: true }"
                  @initialized="saveGridInstance"
                  @exporting="onExporting"
                >
                  <DxFilterRow :visible="true" />
                  <DxColumn
                    v-for="key in Object.keys(dataIn.kea3[exp].TopRank[0]).filter(col => col !== 'Query Name')"
                    :key="key + '_column'"
                    :width="250"
                    :caption="key"
                    :calculate-cell-value="getValue(key)"
                    :calculate-sort-value="getValueAbsolute(key)"
                    alignment="left"
                    :data-type="[ 'TF', 'Library', 'Overlapping_Genes'].includes(key) ? 'string' : 'number'"
                    :sort-order="key === 'Rank' ? 'asc' : null"
                    :allow-sorting="true"
                    :allow-filtering="['TF', 'Library', 'Overlapping_Genes'].includes(key)"
                    :format="{formatter: val => key=== 'Rank' ? val : val.toFixed(2)}"
                  />
                  <DxPaging :page-size="10" />
                  <DxPager
                    :show-page-size-selector="true"
                    :allowed-page-sizes="[5, 10, 25]"
                  />
                </DxDataGrid>
                <TheEnrichmentTablePlaceholder v-else />
              </v-tab-item>
            </template>
          </template>

          <v-tab-item
            value="kstar-st"
          >
            <DxDataGrid
              v-if="dataIn.kstar.ST && dataIn.kstar.ST.length > 0"
              :ref="dataGridRefName + '-' + kinaseActivityTab"
              :data-source="dataIn.kstar.ST"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.kstar.ST[0])"
                :key="key + '_column'"
                :width="250"
                :caption="(key === 'Kinase') ? key : 'p-value ('+key+')'"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Kinase') ? 'string' : 'number'"
                :sort-order="key === 'Kinase' ? null : 'asc'"
                :allow-sorting="true"
                :allow-filtering="(key === 'Kinase')"
                :format="{formatter: val => val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>

          <v-tab-item
            value="kstar-y"
          >
            <DxDataGrid
              v-if="dataIn.kstar.Y && dataIn.kstar.Y.length > 0"
              :ref="dataGridRefName + '-' + kinaseActivityTab"
              :data-source="dataIn.kstar.Y"
              :show-borders="true"
              :repaint-changes-only="false"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
              :allow-column-reordering="true"
              :scrolling="{ useNative: true }"
              @initialized="saveGridInstance"
              @exporting="onExporting"
            >
              <DxFilterRow :visible="true" />
              <DxColumn
                v-for="key in Object.keys(dataIn.kstar.Y[0])"
                :key="key + '_column'"
                :width="250"
                :caption="(key === 'Kinase') ? key : 'p-value ('+key+')'"
                :calculate-cell-value="getValue(key)"
                :calculate-sort-value="getValueAbsolute(key)"
                alignment="left"
                :data-type="(key === 'Kinase') ? 'string' : 'number'"
                :sort-order="key.startsWith('Kinase') ? null : 'asc'"
                :allow-sorting="true"
                :allow-filtering="(key === 'Kinase')"
                :format="{formatter: val => val.toFixed(2)}"
              />
              <DxPaging :page-size="10" />
              <DxPager
                :show-page-size-selector="true"
                :allowed-page-sizes="[5, 10, 25]"
              />
            </DxDataGrid>
            <TheEnrichmentTablePlaceholder v-else />
          </v-tab-item>
        </v-tabs-items>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager,
  DxFilterRow
} from 'devextreme-vue/data-grid'
import TheEnrichmentTablePlaceholder from './TheEnrichmentTablePlaceholder'
import downloadUtils from '../../../utils/downloadUtils'

export default {
  components: {
    TheEnrichmentTablePlaceholder,
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow
  },
  props: {
    dataGridRefName: {
      type: String,
      default: 'assayGrid'
    },
    dataIn: {
      type: Object,
      default: () => {
        return {
          ptmsea: [],
          gc: [],
          gcr: [],
          ksea: [],
          ksea_rokai: [],
          motif: [],
          kea3: [],
          kstar: []
        }
      }
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    peaVsKaiTab: 'pea',
    pathwayEnrichmentTab: 'ptmsea',
    kinaseActivityTab: 'ksea'
  }),
  methods: {
    getValue: function (key) {
      return rowData => rowData[key]
    },
    getValueAbsolute: function (key) {
      return rowData => Math.abs(rowData[key])
    },
    saveGridInstance: function (e) {
      this.dataGridInstance = e.component
      // The isLoading watcher is triggered before we arrive here, but the loading indicator cannot be shown
      // before this function has been run. So we need to check again whether we are in a loading state
      if (this.isLoading) {
        this.dataGridInstance.beginCustomLoading()
      }
    },
    onExporting: function () {
      const tabName = (this.peaVsKaiTab === 'pea') ? this.pathwayEnrichmentTab : this.kinaseActivityTab
      downloadUtils.downloadDxDataGridCSV(
                `Enrichment-${tabName}.csv`,
                this.$refs[`${this.dataGridRefName}-${tabName}`]
      )
    }
  }
}

</script>

<style>
@import './ThePathwayEnrichmentTables.css.prdb';
</style>

<template>
  <v-row class="expression-heatmap pa-4 grey lighten-3">
    <v-col
      sm="12"
      md="3"
      lg="2"
    >
      <v-card flat>
        <loading-overlay :loading="selectionLoading" />
        <v-card-title
          tag="h1"
        >
          Expression Heatmap
        </v-card-title>

        <v-card-text>
          <div v-if="!isPasteTextList">
            <the-expression-heatmap-protein-select
              v-model="selectedProteins"
            />

            <v-btn
              class="mt-2"
              text
              x-small
              @click="isPasteTextList = true"
            >
              <v-icon
                class="mr-1"
                x-small
              >
                mdi-content-paste
              </v-icon>
              Or paste text list
            </v-btn>
          </div>

          <div v-else>
            <v-textarea
              v-model="textList"
              outlined
              placeholder="Separate multiple proteins via semicolon, comma, tab or line break. Only alphanumerics, *, _ and - are allowed."
              @change="handleTextListChange"
            />

            <v-btn
              text
              small
              @click="isPasteTextList = false"
            >
              <v-icon
                class="mr-1"
                small
              >
                mdi-arrow-left
              </v-icon>
              Back
            </v-btn>
          </div>

          <v-btn
            :loading="loading"
            :disabled="!isSelectionChanged || !hasProteinsSelection"
            color="primary"
            block
            class="mt-4"
            @click="loadHeatmap"
          >
            Load Heatmap
          </v-btn>
          <span
            v-if="!isSelectionChanged"
            class="text-caption"
          >
            Current selection already loaded
          </span>
          <span
            v-if="!hasProteinsSelection"
            class="text-caption"
          >
            Enter proteins above to load heatmap
          </span>

          <v-radio-group
            v-model="selectedOmicsType"
            label="Omics type"
          >
            <v-radio
              v-for="omicsType of omicsTypes"
              :key="omicsType"
              :label="omicsType"
              :value="omicsType"
            />
          </v-radio-group>

          <legend class="v-label mt-4">
            Biological source
          </legend>
          <v-checkbox
            v-for="{text, value} of biologicalSourceItems"
            :key="value"
            v-model="selectedBiologicalSources"
            :label="text"
            :value="value"
            hide-details
            class="biological-source-checkbox"
          />

          <v-radio-group
            v-model="selectedQuantCalcMethod"
            label="Quantification / calculation method"
            class="mt-8"
          >
            <v-radio
              v-for="{text, value} of quantCalcMethodItems"
              :key="value"
              :label="text"
              :value="value"
            />
          </v-radio-group>

          <v-checkbox
            v-model="selectedSwissprotOnly"
            label="Swissprot only"
            hide-details
          />
          <v-checkbox
            v-model="selectedIsoforms"
            label="Isoforms"
            hide-details
          />
          <v-checkbox
            v-model="selectedImpute"
            label="Impute missing values"
            hide-details
          />

          <p class="mt-6">
            You can query for multiple gene names, accession ids or search terms contained in the protein name.
            You can use <code class="text-body-2">*</code> as a wildcard character.
          </p>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col
      sm="12"
      md="9"
      lg="10"
    >
      <v-card flat>
        <loading-overlay :loading="loading" />
        <v-toolbar
          class="overflow-x-auto"
          flat
          rounded
        >
          <v-btn
            :disabled="loading || !hasData || !hasSelectedRows"
            outlined
            small
            color="primary"
            class="ml-2"
            title="Remove the selected rows and reload the heatmap"
            @click="excludeSelectedRows"
          >
            <v-icon left>
              mdi mdi-table-row-remove
            </v-icon>
            Remove rows
          </v-btn>
          <v-btn
            :disabled="loading || !hasData || !hasSelectedCols"
            outlined
            small
            color="primary"
            class="ml-2"
            title="Remove the selected columns and reload the heatmap"
            @click="excludeSelectedCols"
          >
            <v-icon left>
              mdi mdi-table-column-remove
            </v-icon>
            Remove columns
          </v-btn>

          <v-btn
            v-if="hasExcludedRows"
            outlined
            small
            class="ml-2"
            title="Reset the removed rows"
            @click="resetExcludedRows"
          >
            <v-icon left>
              mdi mdi-reload
            </v-icon>
            <v-icon left>
              mdi mdi-table-row
            </v-icon>
            Reset rows
          </v-btn>
          <v-btn
            v-if="hasExcludedCols"
            outlined
            small
            class="ml-2"
            title="Reset the removed rows"
            @click="resetExcludedCols"
          >
            <v-icon left>
              mdi mdi-reload
            </v-icon>
            <v-icon left>
              mdi mdi-table-column
            </v-icon>
            Reset columns
          </v-btn>

          <v-spacer />

          <v-btn
            outlined
            :disabled="loading || !hasData"
            :href="getGProfilerUrl"
            target="_blank"
            class="mr-8"
            title="Open the selected genes in g:Gost tool of g:Profiler (if now rows are selected all loaded genes are used)"
          >
            <v-icon left>
              mdi mdi-open-in-new
            </v-icon>
            g:Profiler
          </v-btn>

          <v-dialog
            v-model="downloadSvgDialog"
            width="1920"
          >
            <!-- TODO: move to separate component -->
            <template #activator="{ on, attrs }">
              <v-btn
                class="mr-2"
                :disabled="loading || !hasData"
                elevation="0"
                title="Download the currently shown as SVG"
                v-bind="attrs"
                v-on="on"
                @click="updateExportSVG"
              >
                <v-icon left>
                  mdi mdi-file-download
                </v-icon>
                Download SVG
              </v-btn>
            </template>

            <v-card>
              <v-card-title class="text-h5 mb-4">
                Download Heatmap SVG
              </v-card-title>

              <v-card-text>
                <v-row class="mb-6">
                  <v-col
                    sm="12"
                    lg="6"
                  >
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model.number="exportSVGOptions.dendrogramHeights.top"
                          label="Dendrogram top height"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="6">
                        <v-text-field
                          v-model.number="exportSVGOptions.dendrogramHeights.left"
                          label="Dendrogram left height"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model.number="exportSVGOptions.labelsHeights.top"
                          label="Labels top height"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="6">
                        <v-text-field
                          v-model.number="exportSVGOptions.labelsHeights.left"
                          label="Labels left height"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          v-model.number="exportSVGOptions.colorAnnotHeights.top"
                          label="Color annotation height"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col
                    sm="12"
                    lg="6"
                  >
                    <v-row>
                      <v-col cols="6">
                        <v-text-field
                          v-model.number="exportSVGOptions.cellWidth"
                          label="Cell width"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="6">
                        <v-text-field
                          v-model.number="exportSVGOptions.cellHeight"
                          label="Cell height"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="12">
                        <v-text-field
                          v-model.number="exportSVGOptions.fontSize"
                          label="Font size"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          v-model.number="exportSVGOptions.legendMargin"
                          label="Legend left margin"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          v-model.number="exportSVGOptions.legendWidth"
                          label="Legend width"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          v-model.number="exportSVGOptions.legendHeight"
                          label="Legend height"
                          type="number"
                          min="0"
                          step="1"
                          outlined
                          dense
                          hide-details
                          @input="updateExportSVG"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <div class="d-flex">
                  <v-btn
                    color="primary"
                    elevation="0"
                    @click="downloadSvg"
                  >
                    <v-icon left>
                      mdi mdi-file-download
                    </v-icon>
                    Download SVG
                  </v-btn>
                </div>

                <v-divider class="my-4" />

                <h3 class="text-h5 mb-4">
                  Preview:
                </h3>
                <!-- eslint-disable vue/no-v-html -->
                <div
                  class="export-svg-preview"
                  v-html="exportSVG"
                />
                <!-- eslint-enable vue/no-v-html -->
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-btn
            :disabled="loading || !hasData"
            elevation="0"
            title="Download the currently shown data as a CSV file"
            @click="downloadCsv"
          >
            <v-icon left>
              mdi mdi-file-download
            </v-icon>
            Download CSV
          </v-btn>
        </v-toolbar>

        <v-divider />

        <v-card-text class="overflow-x-auto">
          <v-row v-if="hasData">
            <v-col
              md="12"
              lg="10"
            >
              <biowc-heatmap
                ref="heatmap"
                class="heatmap"
                :data.prop="data"
                :cell-color-scale.prop="colorScale"
                :labels.prop="labels"
                :dendrograms.prop="dendrograms"
                :color-annots.prop="{top: colorAnnot}"
                :color-annot-labels.prop="{top: colorAnnotLabels}"
                :axis-labels.prop="axisLabels"
                :dendrogram-min-height-fraction.prop="dendrogramMinHeightFraction"
                @biowc-heatmap-select="handleHeatmapSelect"
              />
            </v-col>
            <v-col
              class="d-flex flex-column justify-center"
              md="12"
              lg="2"
            >
              <biowc-heatmap-legend
                class="legend"
                :color-scale-title="colorScaleTitle"
                :for-heatmap.prop="heatmapRef"
                :format-color-tick.prop="formatColorTick"
              />
            </v-col>
          </v-row>
          <v-row
            v-else-if="hasLastFetchedSelection"
            class="heatmap-placeholder"
          >
            <v-col
              sm="12"
              class="d-flex flex-column justify-center align-center"
            >
              <v-alert
                text
                type="warning"
              >
                Your search returned no data.
              </v-alert>
            </v-col>
          </v-row>
          <v-row
            v-else
            class="heatmap-placeholder"
          >
            <v-col
              sm="12"
              class="d-flex flex-column justify-center align-center"
            >
              <v-alert
                v-if="$vuetify.breakpoint.mdAndUp"
                color="blue-grey"
                text
                icon="mdi-arrow-left"
              >
                Search for protein sets on the left to load heatmap here
              </v-alert>
              <v-alert
                v-if="$vuetify.breakpoint.smAndDown"
                color="blue-grey"
                text
                icon="mdi-arrow-up"
              >
                Search for protein sets above to load heatmap here
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card
        flat
        class="mt-8"
      >
        <v-card-title tag="h3">
          Usage notes:
        </v-card-title>
        <v-card-text>
          <ul class="mb-4">
            <li>Use <code>ctrl + <em>mousewheel</em></code> to zoom vertically</li>
            <li>Use <code>ctrl + shift + <em>mousewheel</em></code> to zoom horizontally</li>
            <li>Use <code><em>mousewheel</em></code> to scroll vertically</li>
            <li>Use <code>shift + <em>mousewheel</em></code> to scroll vertically</li>
          </ul>
          <p>
            The bottom {{ (dendrogramMinHeightFraction *100).toFixed(0) }}% of dendrogram height are only a visual aid and do not reflect actual distance.
          </p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import saveAs from 'file-saver'

import { BiowcHeatmap, BiowcHeatmapLegend } from 'biowc-heatmap'
import TheExpressionHeatmapProteinSelect from '@/components/partials/analytics/expressionHeatmap/TheExpressionHeatmapProteinSelect.vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'

if (window.customElements.get('biowc-heatmap') === undefined) {
  window.customElements.define('biowc-heatmap', BiowcHeatmap)
}
if (window.customElements.get('biowc-heatmap-legend') === undefined) {
  window.customElements.define('biowc-heatmap-legend', BiowcHeatmapLegend)
}

export default {
  components: {
    TheExpressionHeatmapProteinSelect,
    LoadingOverlay
  },
  data: () => ({
    isPasteTextList: false,
    textList: '',
    axisLabels: {
      top: 'Sample source',
      left: 'Protein'
    },
    dendrogramMinHeightFraction: 0.01,
    colorScaleTitle: 'log₁₀ normalized protein expression',
    biologicalSourceItems: [
      {
        text: 'Tissue',
        value: 'tissue'
      },
      {
        text: 'Fluid',
        value: 'fluid'
      },
      {
        text: 'Cell line',
        value: 'cell line'
      }
    ],
    heatmapRef: null,
    downloadSvgDialog: false,
    exportSVG: '',
    exportSVGOptions: {
      cellWidth: 16,
      cellHeight: 16,
      axisLabelHeights: {
        top: 40,
        left: 40
      },
      dendrogramHeights: {
        top: 120,
        left: 120
      },
      labelsHeights: {
        top: 200,
        left: 80
      },
      colorAnnotHeights: {
        top: 12
      },
      legendWidth: 300,
      legendHeight: 800,
      legendMargin: 50,
      fontSize: 16
    }
  }),
  computed: {
    ...mapGetters({
      hasData: 'analytics/expressionHeatmap/hasData',
      rowLabels: 'analytics/expressionHeatmap/getRowLabels',
      columnLabels: 'analytics/expressionHeatmap/getColumnLabels',
      topDendrogram: 'analytics/expressionHeatmap/getTopDendrogram',
      leftDenrogram: 'analytics/expressionHeatmap/getLeftDendrogram',
      colorAnnot: 'analytics/expressionHeatmap/getTopColorAnnot',
      colorAnnotLabels: 'analytics/expressionHeatmap/getTopColorAnnotLabels',
      isSelectionChanged: 'analytics/expressionHeatmap/isSelectionChanged',
      hasProteinsSelection: 'analytics/expressionHeatmap/hasProteinsSelection',
      getSelectionQuery: 'analytics/expressionHeatmap/getSelectionQuery',
      colorScale: 'analytics/expressionHeatmap/getColorScale',
      hasExcludedRows: 'analytics/expressionHeatmap/hasExcludedRows',
      hasExcludedCols: 'analytics/expressionHeatmap/hasExcludedCols',
      hasLastFetchedSelection: 'analytics/expressionHeatmap/hasLastFetchedSelection',
      getGProfilerUrl: 'analytics/expressionHeatmap/getGProfilerUrl'
    }),
    ...mapState({
      /** @returns {boolean} */
      loading: state => state.analytics.expressionHeatmap.loading,
      /** @returns {boolean} */
      selectionLoading: state => state.analytics.expressionHeatmap.selectionLoading,
      /** @returns {number[][]} */
      data: state => state.analytics.expressionHeatmap.data.mapdata,
      /** @returns {string[]} */
      omicsTypes: state => state.analytics.expressionHeatmap.omicsTypes,
      /** @returns {{ method: string, unit: string }[]} */
      quantCalcMethods: state => state.analytics.expressionHeatmap.quantCalcMethods,
      /** @returns {any} */
      lastFetchedQUery: state => state.analytics.expressionHeatmap.lastFetchedQUery
    }),
    selectedBiologicalSources: {
      /** @returns {string[]} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedBiologicalSources']
      },
      /** @param {string[]} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedBiologicalSources', value)
      }
    },
    selectedSwissprotOnly: {
      /** @returns {boolean} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedSwissprotOnly']
      },
      /** @param {boolean} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedSwissprotOnly', value)
      }
    },
    selectedIsoforms: {
      /** @returns {boolean} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedIsoforms']
      },
      /** @param {boolean} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedIsoforms', value)
      }
    },
    selectedImpute: {
      /** @returns {boolean} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedImpute']
      },
      /** @param {boolean} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedImpute', value)
      }
    },
    selectedProteins: {
      /** @returns {string[]} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedProteins']
      },
      /** @param {string[]} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedProteins', value)
      }
    },
    selectedRowIndices: {
      /** @returns {number[]} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedRowIndices']
      },
      /** @param {number[]} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedRowIndices', value)
      }
    },
    selectedColIndices: {
      /** @returns {number[]} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedColIndices']
      },
      /** @param {number[]} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedColIndices', value)
      }
    },
    selectedQuantCalcMethod: {
      /** @returns {string} */
      get () {
        return this.$store.getters['analytics/expressionHeatmap/getSelectedQuantCalcMethod']
      },
      /** @param {string} value */
      set (value) {
        this.$store.commit('analytics/expressionHeatmap/setSelectedQuantCalcMethod', value)
      }
    },
    selectedOmicsType: {
      /** @returns {string} */
      get () {
        return this.$store.state.analytics.expressionHeatmap.selection.omicsType
      },
      /** @param {string} selectedOmicsType */
      set (selectedOmicsType) {
        this.$store.commit(
          'analytics/expressionHeatmap/setSelectedOmicsType',
          selectedOmicsType
        )
        this.fetchQuantificationAndCalculation()
      }
    },
    /** @returns {{ left: string[], top: string[] }} */
    labels () {
      return {
        left: this.rowLabels,
        top: this.columnLabels
      }
    },
    /** @returns {{ left: any, top: any }} */
    dendrograms () {
      return {
        top: this.topDendrogram,
        left: this.leftDenrogram
      }
    },
    /** @returns {{ text: string, value: number }[]} */
    quantCalcMethodItems () {
      return this.quantCalcMethods.map((q, i) => ({
        text: `${q.method} / ${q.unit}`,
        value: i
      }))
    },
    /** @returns {boolean} */
    hasSelectedRows () {
      return this.selectedRowIndices.size > 0
    },
    /** @returns {boolean} */
    hasSelectedCols () {
      return this.selectedColIndices.size > 0
    }
  },
  watch: {
    '$route.query': {
      handler: async function () {
        await this.setSelectionFromQuery(this.$route.query)

        if (this.isSelectionChanged && this.hasProteinsSelection) {
          await this.fetchData()
          this.updateLegendHeatmapRef()
        }
      },
      deep: true,
      immediate: true
    }
  },
  async mounted () {
    this.resetState()
    await this.setSelectionFromQuery(this.$route.query)

    if (this.isSelectionChanged && this.hasProteinsSelection) {
      await this.fetchData()
      this.updateLegendHeatmapRef()
    }
  },
  methods: {
    ...mapActions({
      fetchQuantificationAndCalculation: 'analytics/expressionHeatmap/fetchQuantificationAndCalculation',
      setSelectionFromQuery: 'analytics/expressionHeatmap/setSelectionFromQuery',
      downloadCsv: 'analytics/expressionHeatmap/downloadCsv'
    }),
    ...mapMutations({
      addSelectedExcludeRowsByIndex: 'analytics/expressionHeatmap/addSelectedExcludeRowsByIndex',
      addSelectedExcludeColsByIndex: 'analytics/expressionHeatmap/addSelectedExcludeColsByIndex',
      clearSelectedExcludeRows: 'analytics/expressionHeatmap/clearSelectedExcludeRows',
      clearSelectedExcludeCols: 'analytics/expressionHeatmap/clearSelectedExcludeCols',
      resetState: 'analytics/expressionHeatmap/resetState'
    }),
    async fetchData () {
      await this.$store.dispatch('analytics/expressionHeatmap/fetchData')
    },
    async loadHeatmap () {
      await this.fetchData()
      this.$router.push({ query: this.getSelectionQuery })
      this.updateLegendHeatmapRef()
    },
    handleTextListChange () {
      if (this.isPasteTextList) {
        this.selectedProteins = this.textList.trim().split(/(;|,|\n|\t)/)
        this.selectedProteins = this.selectedProteins.filter(
          p => !p.match(/(;|,|\n|\t)/) && p.length > 0
        )
      }
    },
    handleHeatmapSelect (event) {
      this.selectedRowIndices = event.detail.selectedRows
      this.selectedColIndices = event.detail.selectedCols
    },
    clearHeatmapSelection () {
      this.selectedRowIndices = new Set()
      this.selectedColIndices = new Set()
      this.$refs.heatmap.selectedRows = new Set()
      this.$refs.heatmap.selectedCols = new Set()
    },
    async excludeSelectedRows () {
      this.addSelectedExcludeRowsByIndex([...this.selectedRowIndices])
      await this.loadHeatmap()
      this.clearHeatmapSelection()
    },
    async excludeSelectedCols () {
      this.addSelectedExcludeColsByIndex([...this.selectedColIndices])
      await this.loadHeatmap()
      this.clearHeatmapSelection()
    },
    async resetExcludedRows () {
      this.clearSelectedExcludeRows()
      this.clearHeatmapSelection()
      await this.loadHeatmap()
    },
    async resetExcludedCols () {
      this.clearSelectedExcludeCols()
      this.clearHeatmapSelection()
      await this.loadHeatmap()
    },
    formatColorTick (d) {
      if (d === 0) {
        return 'low'
      }

      if (d === this.colorScale.values[this.colorScale.values.length - 1]) {
        return 'high'
      }

      return ''
    },
    updateLegendHeatmapRef () {
      this.$nextTick(
        () => { this.heatmapRef = this.$refs.heatmap }
      )
    },
    downloadSvg () {
      this.updateExportSVG()
      saveAs(new Blob([this.exportSVG], { type: 'image/svg+xml' }), 'heatmap.svg')
    },
    updateExportSVG () {
      const temp = document.createElement('div')
      const svg = this.heatmapRef.exportSVG({
        legendColorScaleTitle: this.colorScaleTitle,
        legendFormatColorTick: this.formatColorTick,
        ...this.exportSVGOptions
      })
      temp.appendChild(svg)

      this.exportSVG = temp.innerHTML
    }
  }
}
</script>

<style lang="scss" scoped>
.expression-heatmap {
  font-size: 16px;
  line-height: 1;
}

.heatmap {
  min-width: 600px;
  line-height: 1;
  height: 76vh;
  --biowc-heatmap-top-size: 240px;
  --biowc-heatmap-left-size: 200px;
  --biowc-heatmap-dendrogram-top-size: 100px;
  --biowc-heatmap-dendrogram-left-size: 100px;
}

.heatmap-placeholder {
  height: 64vh;
}

.legend-title {
  margin-bottom: 1em;
}

.legend {
  font-size: 16px;
  --biowc-heatmap-legend-color-scale-gradient-width: 70px;
}

.biological-source-checkbox {
  margin-top: 0.25em;
}

.export-svg-preview {
  overflow: auto;
  max-height: 50vh;
}
</style>

<style>
.expression-heatmap .v-input--radio-group legend.v-label {
  font-size: 16px;
}
</style>

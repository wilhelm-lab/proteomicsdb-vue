<template>
  <v-row
    v-if="hasData"
    style="position: relative"
  >
    <v-col
      cols="12"
      class="d-flex"
    >
      <v-spacer />
      <download-speed-dial
        top
        right
        direction="left"
        csv
        svg
        @csv="downloadCSV"
        @svg="downloadSVG"
      />
    </v-col>

    <v-col cols="12">
      <DxDataGrid
        ref="assayGrid"
        :data-source="dataIn"
        :show-borders="true"
        :repaint-changes-only="false"
        :column-auto-width="true"
        :allow-column-resizing="true"
        column-resizing-mode="widget"
        :scrolling="{ useNative: true }"
      >
        <DxFilterRow :visible="true" />
        <DxHeaderFilter
          :visible="true"
          :allow-search="true"
          :width="300"
        />
        <DxColumn
          caption="Protein Target"
          cell-template="proteinTemplate"
          :calculate-cell-value="searchableProteinTarget"
          :allow-filtering="true"
          :allow-sorting="true"
          :filter-operations="['contains', 'notcontains','startswith','endswith']"
          selected-filter-operation="contains"
        />
        <template #proteinTemplate="{ data }">
          <a
            :href="createUniProtLink(data.data.uniprot)"
            target="_blank"
          >
            {{ data.data.geneName || data.data.uniprot }}
          </a>
        </template>
        <DxColumn
          caption="Assay Type"
          data-field="assayType"
          data-type="string"
        />
        <DxColumn
          caption="System"
          data-field="properties.SYSTEM"
        />
        <DxColumn
          caption="R2"
          :min-width="75"
          data-field="properties.cod"
          :allow-header-filtering="false"
          selected-filter-operation=">="
          alignment="left"
          data-type="number"
        >
          <DxFormat
            type="fixedPoint"
            :precision="2"
          />
        </DxColumn>
        <DxColumn
          caption="EC50"
          :min-width="100"
          data-field="properties.IC50"
          selected-filter-operation="<="
          :allow-header-filtering="false"
          sort-order="asc"
          alignment="left"
          data-type="number"
        >
          <DxFormat
            type="fixedPoint"
            :precision="2"
          />
        </DxColumn>
        <DxColumn
          caption="Repository"
          :calculate-cell-value="searchableRepo"
          :allow-filtering="true"
          :filter-operations="['contains', 'notcontains','startswith','endswith']"
          selected-filter-operation="contains"
          cell-template="repoTemplate"
        />
        <template #repoTemplate="{ data }">
          <project-links
            :project-id="data.data.properties.sanProjectId.toString()"
            :project-name="data.data.properties.sanProjectName"
            :experiment-id="data.data.properties.sanExperimentId.toString()"
            :experiment-name="data.data.properties.sanExperimentName"
            :design-id="data.data.properties.sanExpDesignId.toString()"
            :design-name="data.data.properties.sanExpDesignName"
          />
        </template>
        <DxColumn
          caption="Plot"
          :width="750"
          cell-template="plotTemplate"
        />
        <template #plotTemplate="{ data }">
          <div>
            <!-- helper title which is only shown in SVG export -->
            <svg
              :ref="`svgExportTitle-responseCurve${data.data.curveId}`"
              width="500"
              height="50"
              class="response-curve-svg-export-title"
            >
              <text
                x="50"
                y="50"
                font-size="16"
                font-family="sans-serif"
                fill="black"
              >
                {{ data.data.geneName }} - {{ data.data.assayType }}
              </text>
            </svg>

            <generic-line-plot
              :ref="'responseCurve' + data.data.curveId"
              :min-height="250"
              :min-width="500"
              :curve-parameters="[data.data.parameter]"
              :data-points="[data.data.data]"
              :properties="[data.data.properties]"
              x-axis-label="concentration in nM"
              y-axis-label="relative intensity"
              kinobeads
              hide-legend
              ratio-y
            />
          </div>
        </template>
        <DxPaging :page-size="5" />
        <DxPager
          :show-page-size-selector="true"
          :allowed-page-sizes="[5, 10, 25]"
        />
      </DxDataGrid>
    </v-col>

    <canvas
      id="canvasId"
      style="display:none"
    />
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow, DxFormat, DxHeaderFilter } from 'devextreme-vue/data-grid'
import downloadUtils from '../../utils/downloadUtils'

import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import GenericLinePlot from '@/vue-d3-components/GenericLinePlot'
import ProjectLinks from '@/components/ProjectLinks'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxFormat,
    DxHeaderFilter,
    GenericLinePlot,
    DownloadSpeedDial,
    ProjectLinks
  },
  data: () => ({
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      hasData: 'drug/targets/hasData',
      dataIn: 'drug/targets/getData',
      drugName: 'drug/getDrugName',
      chemblId: 'drug/getChemblId'
    })
  },
  methods: {
    createUniProtLink: function (accId) {
      return accId.includes('-')
        ? new URL('https://www.uniprot.org/uniprot/' + accId.split('-')[0] + '#' + accId).href
        : new URL('https://www.uniprot.org/uniprot/' + accId).href
    },
    searchableRepo (data) {
      return data.properties.sanProjectName !== 'private' ? data.properties.sanProjectName + ' ' + data.properties.sanExperimentName + ' ' + data.properties.sanExpDesignName : 'nondisclosure'
    },
    searchableProteinTarget (data) {
      return data.geneName || data.uniprot
    },
    downloadCSV () {
      downloadUtils.downloadDxDataGridCSV(
                `${this.drugName}_${this.chemblId}_dose_response.csv`,
                this.$refs.assayGrid,
                {
                  Plot: data => data.data
                    .sort((a, b) => a[0] - b[0])
                    .map((p) => p[0] + ':' + p[1])
                    .join(' ')
                },
                {
                  Plot: () => 'concentration:intensity [nM:relative]'
                }
      )
    },
    downloadSVG () {
      const plots = []

      for (const refKey in this.$refs) {
        if (refKey.startsWith('responseCurve')) {
          let plotComponent = this.$refs[refKey]
          let svgExportTitle = this.$refs['svgExportTitle-' + refKey]

          if (Array.isArray(plotComponent)) {
            plotComponent = plotComponent[0]
          }

          if (Array.isArray(svgExportTitle)) {
            svgExportTitle = svgExportTitle[0]
          }

          plots.push(svgExportTitle)
          plots.push(plotComponent.getSVG())
        }
      }

      if (plots.length > 0) {
        downloadUtils.downloadSVGs(
          plots,
                    `${this.drugName} ${this.chemblId} target response curves`,
                    true,
                    'canvasId',
                    this.svgCss
        )
      }
    }
  }
}
</script>

<style scoped>
.response-curve-svg-export-title {
    display: none;
}
</style>

<template>
  <v-row>
    <v-col cols="12">
      <v-row class="mb-3">
        <v-spacer />
        <downloader
          top
          right
          direction="left"
          csv
          svg
          @csv="getCSV"
          @svg="getSVG"
        />
      </v-row>
      <v-col cols="12">
        <DxDataGrid
          ref="dataGrid"
          :data-source="dataIn"
          :show-borders="true"
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
            caption="Inhibitor"
            data-type="string"
            cell-template="inhibitorTemplate"
            :calculate-cell-value="searchableInhibitor"
            :allow-filtering="true"
            :allow-sorting="true"
            :filter-operations="['contains', 'notcontains','startswith','endswith']"
            selected-filter-operation="contains"
          />
          <template #inhibitorTemplate="{ data }">
            <a
              :href="getChemblUrl(data.data.properties.CHEMBL_ID)"
              target="_blank"
            >{{ data.data.properties.TREATMENT }}</a>
          </template>

          <DxColumn
            caption="Assay Type"
            data-field="assayType"
            data-type="string"
          />
          <DxColumn
            caption="System"
            data-field="properties.SYSTEM"
            data-type="string"
          />
          <DxColumn
            caption="R2"
            :min-width="75"
            data-field="properties.cod"
            :filter-value="rSqFilterValue"
            :allow-header-filtering="false"
            selected-filter-operation=">="
            data-type="number"
            alignment="left"
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
            :filter-value="ecFilterValue"
            selected-filter-operation="<="
            :allow-header-filtering="false"
            data-type="number"
            sort-order="asc"
            alignment="left"
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
            data-type="string"
          />
          <DxColumn
            caption="Plot"
            :width="750"
            cell-template="plotTemplate"
            data-type="object"
          />
          <template #plotTemplate="{ data }">
            <plot
              :ref="'responseCurve-' + data.data.curveId"
              :min-height="250"
              :min-width="600"
              :curve-parameters="[data.data.parameter]"
              :data-points="[data.data.data]"
              :properties="[data.data.properties]"
              x-axis-label="concentration in nM"
              y-axis-label="relative intensity"
              kinobeads
              hide-legend
              ratio-y
            />
          </template>
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
    </v-col>
  </v-row>
</template>

<script>
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow, DxFormat, DxHeaderFilter } from 'devextreme-vue/data-grid'
import plot from '@/vue-d3-components/GenericLinePlot'

import downloader from '@/components/DownloadSpeedDial'
import { mapGetters } from 'vuex'
import downloadUtils from '../../utils/downloadUtils'
import projectLinks from '@/components/ProjectLinks'

export default {
  components: {
    downloader,
    plot,
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxFormat,
    DxHeaderFilter,
    projectLinks
  },
  data: () => ({
    rSqFilterValue: 0.8,
    ecFilterValue: 2000,
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      dataIn: 'protein/inhibitors/getData'
    })
  },
  methods: {
    getChemblUrl (chemblId) {
      return new URL(chemblId, 'https://www.ebi.ac.uk/chembl/compound_report_card/').href
    },
    getCSV () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinInfo.uniprotId}_inhibitors.csv`,
        this.$refs.dataGrid,
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
    getSVG () {
      this.loading = true
      const aPlots = []
      for (const refKey in this.$refs) {
        if (refKey.includes('responseCurve')) {
          // Vue returns a singleton array if the ref was defined in a for loop.
          let domElement = this.$refs[refKey]
          if (Array.isArray(domElement)) domElement = domElement[0]
          aPlots.push(domElement.getSVG())
        }
      }

      if (aPlots) {
        downloadUtils.downloadSVGs(
          aPlots,
          'Inhibitors: ' + this.proteinInfo.uniprotId,
          true,
          'canvasId',
          this.svgCss
        )
      }
      this.loading = false
    },
    searchableRepo (data) {
      return data.properties.sanProjectName !== 'private' ? data.properties.sanProjectName + ' ' + data.properties.sanExperimentName + ' ' + data.properties.sanExpDesignName : 'nondisclosure'
    },
    searchableInhibitor (data) {
      return data.properties.TREATMENT
    }
  }
}
</script>

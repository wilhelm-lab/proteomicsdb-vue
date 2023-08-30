<template>
  <v-row>
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <download-speed-dial
          top
          right
          direction="left"
          csv
          svg
          @csv="getCSV"
          @svg="getSVG"
        />
      </v-row>
    </v-col>
    <v-col cols="12">
      <DxDataGrid
        ref="dataGrid"
        :data-source="dataIn"
        :show-borders="true"
        :repaint-changes-only="false"
        :column-auto-width="true"
        :allow-column-resizing="true"
        column-resizing-mode="widget"
        :selection="{ mode: 'single' }"
        :scrolling="{ useNative: true }"
      >
        <DxFilterRow :visible="true" />
        <DxColumn
          caption="System"
          data-field="properties.SYSTEM"
          data-type="string"
        />
        <DxColumn
          caption="Halftime (h)"
          data-field="properties.HT"
          data-type="number"
          alignment="left"
        >
          <DxFormat
            type="fixedPoint"
            :precision="2"
          />
        </DxColumn>
        <DxColumn
          caption="R2"
          data-field="properties.cod"
          :filter-value="rSqFilterValue"
          selected-filter-operation=">="
          sort-order="desc"
          data-type="number"
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
            :ref="'responseCurve-' + data.data.properties.ExpDesignId"
            :min-height="250"
            :min-width="1000"
            :curve-parameters="data.data.parameter"
            :data-points="data.data.data"
            :properties="[data.data.properties]"
            x-axis-label="Time (h)"
            y-axis-label="relative intensity"
            :log-x="false"
            turnover
            ratio-y
            hide-error-bars
          />
        </template>
        <template #repoTemplate="{ data }">
          <ProjectLinks
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
  </v-row>
</template>

<script>
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow, DxFormat } from 'devextreme-vue/data-grid'
import { mapGetters } from 'vuex'
import downloadUtils from '../../utils/downloadUtils'

import plot from '@/vue-d3-components/GenericLinePlot'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ProjectLinks from '@/components/ProjectLinks'

export default {
  components: {
    plot,
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxFormat,
    DownloadSpeedDial,
    ProjectLinks
  },
  data: () => ({
    rSqFilterValue: 0.6,
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      dataIn: 'protein/turnover/getData'
    })
  },
  methods: {
    getCSV () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinInfo.uniprotId}_turnover.csv`,
        this.$refs.dataGrid
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
          'Turnover: ' + this.proteinInfo.uniprotId,
          true,
          'canvasId',
          this.svgCss
        )
      }
      this.loading = false
    },
    searchableRepo: function (data) {
      return data.properties.sanProjectName !== 'private' ? data.properties.sanProjectName + ' ' + data.properties.sanExperimentName + ' ' + data.properties.sanExpDesignName : 'nondisclosure'
    }
  }
}
</script>

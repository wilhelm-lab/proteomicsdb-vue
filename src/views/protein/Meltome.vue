<template>
  <v-row>
    <v-col cols="12">
      <v-row>
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
    </v-col>

    <v-col cols="12">
      <v-row>
        <v-col cols="12">
          <v-card
            elevation="0"
          >
            <v-card-title>
              <h2 class="text-h5">
                Dataset selection
              </h2>
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="selectedCategory"
                :items="category"
                outlined
                label="Category"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <DxDataGrid
            ref="dataGrid"
            :data-source="dataSource[selectedCategory]"
            :show-borders="true"
            :repaint-changes-only="false"
            :column-auto-width="true"
            :allow-column-resizing="true"
            column-resizing-mode="widget"
            :selection="{ mode: 'single' }"
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
              caption="System"
              data-field="properties.SYSTEM"
              data-type="string"
            />
            <DxColumn
              v-if="selectedCategory === 2"
              caption="Tm"
              data-field="properties.Tm"
              data-type="number"
              alignment="left"
            >
              <DxFormat
                type="fixedPoint"
                :precision="2"
              />
            </DxColumn>
            <DxColumn
              v-if="selectedCategory === -1"
              caption="Delta Tm"
              data-field="properties.DeltaTm"
              data-type="number"
              alignment="left"
            >
              <DxFormat
                type="fixedPoint"
                :precision="2"
              />
            </DxColumn>
            <DxColumn
              v-if="selectedCategory === -1"
              caption="R2 treated"
              data-field="properties.r2Untreated"
              selected-filter-operation=">="
              :filter-value="rSqFilterValue"
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
              v-if="selectedCategory === -1"
              caption="R2 untreated"
              data-field="properties.r2Treated"
              data-type="number"
              alignment="left"
            >
              <DxFormat
                type="fixedPoint"
                :precision="2"
              />
            </DxColumn>
            <DxColumn
              v-if="selectedCategory === 2"
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
              :filter-operations="[
                'contains',
                'notcontains',
                'startswith',
                'endswith',
              ]"
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
                x-axis-label="temperature in °C"
                y-axis-label="relative intensity"
                :log-x="false"
                ratio-y
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
      </v-row>
    </v-col>

    <canvas
      id="canvasId"
      style="display: none"
    />
  </v-row>
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
import plot from '@/vue-d3-components/GenericLinePlot'

import downloader from '@/components/DownloadSpeedDial'
import { mapGetters } from 'vuex'
import downloadUtils from '../../utils/downloadUtils'
import ProjectLinks from '@/components/ProjectLinks.vue'

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
    ProjectLinks
  },
  data: () => ({
    rSqFilterValue: 0.8,
    ecFilterValue: 2000,
    selectedCategory: 2,
    category: [
      { text: 'Melting protein', value: 2 },
      { text: 'CETSA', value: -1 }
    ],
    svgCss: [require('@/vue-d3-components/GenericLinePlot.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      dataSource: 'protein/meltome/getData'
    })
  },
  methods: {
    getCSV () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinInfo.uniprotId}_meltome.csv`,
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
          'Meltome: ' + this.proteinInfo.uniprotId,
          true,
          'canvasId',
          this.svgCss
        )
      }
      this.loading = false
    },
    searchableRepo (data) {
      return data.properties.sanProjectName !== 'private'
        ? data.properties.sanProjectName +
            ' ' +
            data.properties.sanExperimentName +
            ' ' +
            data.properties.sanExpDesignName
        : 'nondisclosure'
    },
    searchableInhibitor (data) {
      return data.properties.TREATMENT
    },
    getChemblUrl (chemblId) {
      return new URL(chemblId, 'https://www.ebi.ac.uk/chembl/compound_report_card/').href
    }
  }
}
</script>

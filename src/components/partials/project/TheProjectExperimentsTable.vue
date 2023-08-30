<template>
  <DxDataGrid
    ref="dataGrid"
    :data-source="projectExperiments"
    :column-auto-width="true"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :hover-state-enabled="true"
    :no-data-text="noDataText"
    :scrolling="{ useNative: true }"
    @rowClick="onRowClick"
    @exporting="onExporting"
  >
    <DxExport :enabled="true" />
    <DxFilterRow
      :visible="true"
    />
    <DxColumn
      caption="Experiment Name"
      data-field="NAME"
      cell-template="experimentName"
    />
    <template #experimentName="{ data }">
      <router-link
        :to="getExperimentRoute(data.data.EXPERIMENT_ID)"
      >
        {{ data.value }}
      </router-link>
    </template>
    <DxColumn
      caption="Description"
      data-field="DESCRIPTION"
    />
    <DxColumn
      caption="Scope"
      data-field="SCOPE"
    />
    <DxColumn
      caption="Experiment ID"
      data-field="EXPERIMENT_ID"
    />
    <DxColumn
      caption="Created"
      data-field="CREATIONDATE"
    />

    <DxPaging :page-size="10" />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[10, 25, 50]"
      :show-navigation-buttons="true"
      :show-info="true"
    />
  </DxDataGrid>
</template>

<script>
import downloadUtils from '../../../utils/downloadUtils'

import {
  DxExport,
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager,
  DxFilterRow
} from 'devextreme-vue/data-grid'

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
    projectExperiments: {
      type: Array,
      default: () => []
    },
    noDataText: {
      type: String,
      default: 'No experiments found'
    },
    projectId: {
      type: String,
      required: true
    }
  },
  methods: {
    onExporting (e) {
      downloadUtils.downloadDxDataGridCSV(
        `${this.projectIdentifier}_experiments.csv`,
        this.$refs.dataGrid
      )

      e.cancel = true
    },
    onRowClick ({ data }) {
      this.$router.push(this.getExperimentRoute(data.EXPERIMENT_ID))
    },
    getExperimentRoute (experimentId) {
      return {
        name: 'projectExperiment',
        params: {
          projectId: this.projectId,
          experimentId
        }
      }
    }
  }
}
</script>

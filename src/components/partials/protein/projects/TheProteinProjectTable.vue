<template>
  <DxDataGrid
    ref="projectGrid"
    :data-source="dataSource"
    :show-borders="true"
    :repaint-changes-only="false"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :column-auto-width="true"
    :scrolling="{ useNative: true }"
  >
    <DxColumnChooser
      :enabled="true"
      :allow-search="true"
      mode="select"
    />
    <DxFilterRow
      :visible="true"
    />
    <DxColumn
      caption="Project Name"
      data-field="EXPERIMENT.PROJECT"
      cell-template="projectTemplate"
    />
    <DxColumn
      caption="PubMed ID"
      data-field="EXPERIMENT.PUBMED_ID"
      cell-template="pubmedTemplate"
    />
    <DxColumn
      caption="Experiment Name"
      data-field="EXPERIMENT.EXPERIMENT"
      cell-template="experimentTemplate"
    />
    <DxColumn
      caption="Sample Name"
      data-field="EXPERIMENT.SAMPLE"
      cell-template="sampleTemplate"
    />
    <DxColumn
      caption="Unique Peptides"
      data-field="EXPERIMENT.UNIQUE_PEPTIDES"
    />
    <DxColumn
      caption="Unique PSMs"
      data-field="EXPERIMENT.UNIQUE_PSMS"
    />
    <DxColumn
      caption="Shared PSMs"
      data-field="EXPERIMENT.SHARED_PSMS"
    />
    <DxColumn
      caption="Evidence"
      data-field="EXPERIMENT.EVIDENCE"
    />
    <template #pubmedTemplate="{ data }">
      <a
        v-if="data.data.EXPERIMENT.PUBMED_LINK"
        :href="data.data.EXPERIMENT.PUBMED_LINK"
        target="_blank"
      >{{ data.data.EXPERIMENT.PUBMED_ID }}</a>
    </template>
    <template #projectTemplate="{ data }">
      <span v-if="isPrivate(data)">
        (nondisclosure) {{ data.data.EXPERIMENT.PROJECT }}
      </span>
      <router-link
        v-else
        :to="{
          name: 'project',
          params: {
            projectId: data.data.EXPERIMENT.PROJECT_ID
          }
        }"
      >
        {{ data.data.EXPERIMENT.PROJECT }}
      </router-link>
    </template>
    <template #experimentTemplate="{ data }">
      <span v-if="isPrivate(data)">
        {{ data.data.EXPERIMENT.EXPERIMENT }}
      </span>
      <router-link
        v-else
        :to="{
          name: 'projectExperiment',
          params: {
            projectId: data.data.EXPERIMENT.PROJECT_ID,
            experimentId: data.data.EXPERIMENT.EXPERIMENT_ID
          }
        }"
      >
        {{ data.data.EXPERIMENT.EXPERIMENT }}
      </router-link>
    </template>
    <template #sampleTemplate="{ data }">
      <span v-if="isPrivate(data)">
        {{ data.data.EXPERIMENT.SAMPLE }}
      </span>
      <router-link
        v-else
        :to="{
          name: 'projectExperimentSample',
          params: {
            projectId: data.data.EXPERIMENT.PROJECT_ID,
            experimentId: data.data.EXPERIMENT.EXPERIMENT_ID,
            // TODO: fix sample id not available as single value
            sampleId: data.data.EXPERIMENT.PROJECT_EXPERIMENT_SAMPLE_ID.split('/')[2]
          }
        }"
      >
        {{ data.data.EXPERIMENT.SAMPLE }}
      </router-link>
    </template>
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
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow, DxColumnChooser } from 'devextreme-vue/data-grid'

import downloadUtils from '../../../../utils/downloadUtils'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxColumnChooser
  },
  props: {
    proteinAccession: {
      type: String,
      default: ''
    },
    dataSource: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onExporting () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinAccession}_projects.csv`,
        this.$refs.projectGrid
      )
    },
    isPrivate (data) {
      const status = data.data.EXPERIMENT.PROJECT_STATUS
      return status === 'private' || status === 'nondisclosure'
    }
  }
}
</script>

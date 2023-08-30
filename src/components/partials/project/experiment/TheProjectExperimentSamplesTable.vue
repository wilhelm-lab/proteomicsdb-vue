<template>
  <DxDataGrid
    ref="experimentSamplesDetailsGrid"
    :data-source="dataIn"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :column-auto-width="true"
    :scrolling="{ useNative: true }"
    :hover-state-enabled="true"
    @rowClick="onRowClick"
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
      caption="Name"
      data-field="NAME"
      cell-template="sampleName"
    />
    <template #sampleName="{ data }">
      <router-link
        :to="getSampleRoute(data.data.SAMPLE_ID)"
      >
        {{ data.value }}
      </router-link>
    </template>
    <DxColumn
      caption="Sample ID"
      data-field="SAMPLE_ID"
      :visible="false"
    />
    <DxColumn
      caption="Taxacode"
      data-field="TAXCODE"
      :visible="false"
    />
    <DxColumn
      caption="Tissue"
      data-field="TISSUE"
    />
    <DxColumn
      caption="Quantification Method"
      data-field="QUANTIFICATION_METHOD"
    />
    <DxColumn
      caption="Digestion Method"
      data-field="PROTEIN_DIGESTION_METHOD"
    />
    <DxColumn
      caption="Online LC System"
      data-field="ONLINE_LIQUID_CHROMATOGRAPHY_SYSTEM"
    />
    <DxColumn
      caption="Mass Spectrometer"
      data-field="MASS_SPECTROMETER"
    />
    <DxColumn
      caption="Protease"
      data-field="PROTEASE_NAME"
    />
    <DxColumn
      caption="Tissue ID"
      data-field="TISSUE_ID"
      :visible="false"
    />
    <DxColumn
      caption="Fragmentation Method"
      data-field="FRAGMENTATION_METHOD"
    />
    <DxColumn
      caption="MS Detector"
      data-field="MS_DETECTOR"
      :visible="false"
    />
    <DxColumn
      caption="MSMS Detector"
      data-field="MSMS_DETECTOR"
      :visible="false"
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
import { DxDataGrid, DxColumn, DxPaging, DxPager, DxFilterRow, DxColumnChooser } from 'devextreme-vue/data-grid'

import router from '@/router'

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
    dataIn: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: String,
      required: true
    },
    experimentId: {
      type: String,
      required: true
    }
  },
  methods: {
    // TODO: map TAXCODE to Species
    onRowClick ({ data }) {
      router.push(this.getSampleRoute(data.SAMPLE_ID))
    },
    getSampleRoute (sampleId) {
      return {
        name: 'projectExperimentSample',
        params: {
          projectId: this.projectId,
          experimentId: this.experimentId,
          sampleId
        }
      }
    }
  }
}
</script>

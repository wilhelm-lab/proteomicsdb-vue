<template>
  <v-card elevation="0">
    <LoadingOverlay :loading="loading" />

    <v-card-title>Files</v-card-title>

    <DxDataGrid
      :data-source="filesData"
      :allow-column-resizing="true"
      column-resizing-mode="widget"
      :column-auto-width="false"
      no-data-text="No files found."
    >
      <DxColumn
        caption="File Name"
        data-field="fileName"
      />
      <DxColumn
        caption="Mimetype"
        data-field="mimetype"
      />
    </DxDataGrid>
  </v-card>
</template>

<script>
import axios from 'axios'
import {
  DxDataGrid,
  DxColumn
} from 'devextreme-vue/data-grid'

import LoadingOverlay from '../../../../LoadingOverlay.vue'

export default {
  components: {
    LoadingOverlay,
    DxDataGrid,
    DxColumn
  },
  props: {
    sampleId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    loading: false,
    filesData: []
  }),
  created () {
    this.loading = true
    this.fetchFiles()
    this.loading = false
  },
  methods: {
    async fetchFiles () {
      const url = this.$store.state.host + `/proteomicsdb/logic/api_v2/api.xsodata/Sample(${this.sampleId})/File?$format=json`
      const response = await axios.get(url)
      const files = response.data.d.results

      for (let i = 0; i < files.length; i++) {
        this.filesData.push({ fileName: files[i].NAME, mimetype: files[i].NAME.substr(files[i].NAME.lastIndexOf('.') + 1) })
      }
    }
  }
}
</script>

<template>
  <v-container>
    <DxDataGrid
      ref="decryptMStats"
      :data-source="dataIn"
      :show-borders="true"
      :repaint-changes-only="false"
      :allow-column-resizing="true"
      column-resizing-mode="widget"
      :column-auto-height="true"
      :scrolling="{ useNative: true }"
    >
      <DxColumn
        caption="Name"
        data-field="Name"
        :min-width="300"
      />
      <DxColumn
        class="dx-decry"
        caption="Phosphorylation"
        data-field="Phosphorylation"
        :min-width="100"
      />
      <DxColumn
        caption="Acetylation"
        data-field="Acetylation"
        :min-width="100"
      />
      <DxColumn
        caption="Ubiquitinylation"
        data-field="Ubiquitinylation"
        :min-width="100"
      />
      <DxColumn
        caption="Unmodified"
        data-field="Unmodified"
        :min-width="100"
      />
      <DxColumn
        caption="Protein-Level"
        data-field="Full Proteome"
        :min-width="100"
      />
      <DxPaging :page-size="10" />
      <DxPager
        :show-page-size-selector="true"
        :allowed-page-sizes="[10, 25, 50]"
      />
    </DxDataGrid>
  </v-container>
</template>

<script>
import 'devextreme/data/odata/store'
import { DxDataGrid, DxColumn, DxPaging, DxPager } from 'devextreme-vue/data-grid'

export default {
  name: 'DecryptMStatTable',
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager
  },
  props: {
    dataIn: {
      type: Array,
      default: Array
    }
  },
  data: () => ({
    dataSource: null,
    currentFilter: null
  })
}
</script>

<style lang="scss" scoped>
[role=gridcell] {
  overflow-wrap: break-word;
  height: auto;
  white-space: normal;
}
</style>

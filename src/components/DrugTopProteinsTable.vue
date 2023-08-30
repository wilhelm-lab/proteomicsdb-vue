<template>
  <DxDataGrid
    :data-source="dataSource"
    :show-borders="true"
    :column-auto-width="true"
  >
    <DxColumn
      caption="Gene"
      data-field="gene_name"
      data-type="string"
    />
    <DxColumn
      caption="Curves"
      data-type="number"
      data-field="n_curves"
    />
  </DxDataGrid>
</template>

<script>
import {
  DxDataGrid,
  DxColumn
} from 'devextreme-vue/data-grid'

export default {
  components: {
    DxDataGrid,
    DxColumn
  },
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  }
}
</script>

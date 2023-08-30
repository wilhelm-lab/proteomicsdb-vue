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
      caption="EC50"
      data-type="number"
      :calculate-cell-value="(d) => `${d.ec50} nM`"
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

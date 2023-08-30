<template>
  <DxDataGrid
    :data-source="dataSource"
    :show-borders="true"
    :column-auto-width="true"
  >
    <DxColumn
      caption="Cellline"
      data-field="cellline_name"
      data-type="string"
    />
    <DxColumn
      caption="Project"
      data-type="string"
      data-field="project_name"
    />
    <DxColumn
      caption="Experiment"
      data-type="string"
      data-field="experiment_name"
    />
    <DxColumn
      caption="Curves"
      data-type="number"
      data-field="n_curves"
    />
    <DxColumn
      :width="100"
      caption="Regulation"
      data-field="regulation"
      data-type="string"
      cell-template="regulationTemplate"
    />
    <template #regulationTemplate="{ data }">
      <v-icon
        v-if="data.value == 'up'"
        color="#ea0000"
      >
        mdi-arrow-up-bold
      </v-icon>
      <v-icon
        v-else-if="data.value == 'down'"
        color="#252bff"
      >
        mdi-arrow-down-bold
      </v-icon>
      <v-icon
        v-else-if="data.value == '-'"
        color="#000000"
      >
        mdi-minus
      </v-icon>
    </template>
    <DxPaging :page-size="10" />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[10]"
    />
  </DxDataGrid>
</template>

<script>
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager
} from 'devextreme-vue/data-grid'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager
  },
  props: {
    dataSource: {
      type: Array,
      default: () => []
    }
  }
}
</script>

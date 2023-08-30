<template>
  <DxDataGrid
    ref="assayGrid"
    :data-source="dataIn"
    :column-auto-width="true"
    :allow-column-resizing="true"
    column-resizing-mode="widget"
    :hover-state-enabled="true"
    :scrolling="{ useNative: true }"
    @rowClick="onSelectionChanged"
  >
    <DxFilterRow :visible="true" />
    <DxHeaderFilter
      :visible="true"
      :allow-search="true"
      :width="300"
    />
    <DxColumn
      caption="ID"
      data-field="PROJECT_ID"
      cell-template="projectId"
    />
    <template #projectId="{ data }">
      <router-link
        :to="{ name: 'project', params: { projectId: data.value.replace(/^PRDB0+/, '') } }"
      >
        {{ data.value }}
      </router-link>
    </template>
    <DxColumn
      caption="Project Name"
      data-field="NAME"
    />
    <DxColumn
      caption="Description"
      data-field="DESCRIPTION"
      :width="300"
    />
    <DxColumn
      caption="Pubmed"
      data-field="PUBMEDID"
    />
    <DxColumn
      caption="Created on"
      data-field="CREATIONDATE"
      :format="{
        formatter: formatDate
      }"
    />
    <DxPaging
      :page-size="15"
    />
    <DxPager
      :show-page-size-selector="true"
      :allowed-page-sizes="[15, 30, 50]"
      :show-navigation-buttons="true"
      :show-info="true"
    />
  </DxDataGrid>
</template>

<script>
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxPager,
  DxFilterRow,
  DxHeaderFilter
} from 'devextreme-vue/data-grid'

export default {
  components: {
    DxDataGrid,
    DxColumn,
    DxPaging,
    DxPager,
    DxFilterRow,
    DxHeaderFilter
  },
  props: {
    dataIn: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onSelectionChanged (row) {
      this.$emit('selection-changed', row)
    },
    formatDate (date) {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
  }
}
</script>

<template>
  <v-main>
    <v-container>
      <v-card
        elevation="0"
        class="overflow-x-auto"
      >
        <v-card-title>API for ProteomicsDB</v-card-title>
        <v-card-subtitle style="margin-bottom: -25px">
          <p>
            As of version 1.1, the usage of the API does not require any
            registration or specific privileges.
          </p>
          <p>
            ProteomicsDB provides an API to download data
            programmatically. This API is based on ODATA specification.
            See also www.odata.org for details. JSON and XML are
            supported return formats.
          </p>
        </v-card-subtitle>
        <v-list>
          <template v-for="item in apis">
            <v-list-item :key="`${item.title}-item`" />
            <h3 :key="`${item.title}-title`">
              {{ item.title }}
            </h3>
            <h4 :key="`${item.title}-description-title`">
              Description:
            </h4>
            <div
              :key="`${item.title}-description-content`"
              class="list-item-content"
            >
              {{ item.description }}
            </div>
            <h4 :key="`${item.title}-exampleurl-title`">
              Example URL:
            </h4>
            <a
              :key="`${item.title}-exampleurl-content`"
              :href="$store.state.host + item.exampleUrl"
              target="_blank"
              class="list-item-content"
            >
              {{ item.exampleUrl }}
            </a>
            <h4 :key="`${item.title}-inputparameters-title`">
              Required Input Parameters:
            </h4>
            <template v-for="(param, i) in item.inputParameters">
              <div
                :key="`${item.title}-inputparameter-${i}`"
                class="list-item-content"
              >
                {{ param }}
              </div>
            </template>
            <h4 :key="`${item.title}-metadatalink-title`">
              See also:
            </h4>
            <a
              :key="`${item.title}-metadatalink-content`"
              :href="$store.state.host + item.metaDataLink"
              target="_blank"
              class="list-item-content"
            >
              {{ item.metaDataLink }}
            </a>
            <h4 :key="`${item.title}-table-title`">
              Possible return fields:
            </h4>
            <DxDataGrid
              :key="`${item.title}-table-content`"
              class="table list-item-content"
              :data-source="item.table"
              :show-borders="true"
              :column-auto-width="true"
              :allow-column-resizing="true"
              column-resizing-mode="widget"
            >
              <DxScrolling mode="virtual" />
            </DxDataGrid>
            <v-divider
              :key="`${item.title}-divider`"
              class="divider"
            />
          </template>
        </v-list>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
import axios from 'axios'
import { DxDataGrid, DxScrolling } from 'devextreme-vue/data-grid'

export default {
  name: 'APIVue',
  components: {
    DxDataGrid,
    DxScrolling
  },
  data: () => ({
    apis: [
      {
        title: 'API Element #1',
        description: 'The first element of the API',
        exampleUrl: '/proteomicsdb/logic/api/element1.xsodata',
        inputParameters: [
          'PARAM1: First parameter',
          'PARAM2: Second parameter'
        ],
        metaDataLink: '/proteomicsdb/logic/api/elemtn1.xsodata/$metadata',
        table: [
          {
            name: 'ENTRY_NAME',
            description: 'Name of protein',
            type: 'String - 64',
            example: 'HDAC2_HUMAN'
          },
          {
            name: 'PROTEIN_NAME',
            description: 'Name of protein given by uniprot',
            type: 'String - 256',
            example: 'Histone deacetylase 2'
          },
          {
            name: 'UNIQUE_IDENTIFIER',
            description: 'Unique identfier protein is set in uniprot',
            type: 'String - 64',
            example: 'Q92769'
          }
        ]
      },
      {
        title: 'API Element #2',
        description: 'The second element of the API',
        exampleUrl: '/proteomicsdb/logic/api/element1.xsodata',
        inputParameters: [
          'PARAM1: First parameter',
          'PARAM2: Second parameter'
        ],
        metaDataLink: '/proteomicsdb/logic/api/elemtn1.xsodata/$metadata',
        table: [
          {
            name: 'ENTRY_NAME',
            description: 'Name of protein',
            type: 'String - 64',
            example: 'HDAC2_HUMAN'
          },
          {
            name: 'PROTEIN_NAME',
            description: 'Name of protein given by uniprot',
            type: 'String - 256',
            example: 'Histone deacetylase 2'
          },
          {
            name: 'UNIQUE_IDENTIFIER',
            description: 'Unique identfier protein is set in uniprot',
            type: 'String - 64',
            example: 'Q92769'
          }
        ]
      }
    ]
  }),
  mounted () {
    this.getApis()
  },
  methods: {
    getApis: function () {
      const that = this

      axios
        .get(this.$store.state.host + '/proteomicsdb/logic/getAPIs.xsjs')
        .then((response) => {
          that.apis = response.data
        })
    }
  }
}
</script>

<style scoped lang="scss">
h3 {
  font-size: 12pt;
  margin-left: 10px;
  margin-bottom: 10px;
}

h4 {
  font-size: 11pt;
  margin-left: 40px;
  margin-top: 20px;
}

a {
  display: block;
  width: 1500px; //TODO: Change to dynamic
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.divider {
  margin-left: 50px;
  width: 2000px;
  background-color: rgb(182, 182, 182);
}

.list-item-content {
  font-size: 10pt;
  margin-left: 80px;
  margin-top: 5px;
}

.table {
  margin-top: 10px;
  margin-bottom: 50px;
  height: 400px;
  width: 1500px;
}
</style>

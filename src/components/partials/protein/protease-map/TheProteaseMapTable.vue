<template>
  <div>
    <DxDataGrid
      ref="dataGrid"
      :data-source="dataSource"
      :show-borders="true"
      :repaint-changes-only="false"
      :column-auto-width="true"
      :selection="{ mode: 'single' }"
    >
      <DxColumn
        caption="Protease Name"
        data-field="PROTEASE_NAME"
      />
      <DxColumn
        caption="Theoretical Coverage [%]"
        data-field="SEQUENCE_COVERAGE"
      />
      <DxColumn
        caption="Cumulative Coverage [%]"
        data-field="CUMULATIVE_SEQUENCE_COVERAGE"
      />
    </DxDataGrid>
  </div>
</template>

<script>
import { DxDataGrid, DxColumn } from 'devextreme-vue/data-grid'

import downloadUtils from '../../../../utils/downloadUtils'

import axios from 'axios'

export default {
  components: {
    DxDataGrid,
    DxColumn
  },
  props: {
    proteinId: {
      type: String,
      default: ''
    },
    proteinAccession: {
      type: String,
      default: ''
    },
    minMass: {
      type: Number,
      default: 0
    },
    maxMass: {
      type: Number,
      default: 0
    },
    minLength: {
      type: Number,
      default: 0
    },
    maxLength: {
      type: Number,
      default: 0
    },
    missedCleavages: {
      type: Number,
      default: 0
    },
    proteases: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    dataSource: {},
    currentFilter: null,
    proteaseNameToId: {},
    proteaseIdToName: {}
  }),
  computed: {
    /** @returns {number[]} */
    proteaseIds () {
      return this.proteases.filter(name => name in this.proteaseNameToId).map(name => this.proteaseNameToId[name])
    },
    /** @returns {string} */
    proteaseDataUrl () {
      return `${this.$store.state.host}/proteomicsdb/logic/getProteaseMapTable.xsjs` +
          `?protein_id=${this.proteinId}&min_length=${this.minLength}` +
          `&max_length=${this.maxLength}&min_mass=${this.minMass}` +
          `&max_mass=${this.maxMass}&missed_cleavages=${this.missedCleavages}` +
          `&proteases=${this.proteaseIds.join(';')}`
    }
  },
  watch: {
    proteinId: function () {
      this.setData()
    }
  },
  async mounted () {
    await this.loadProteaseMappings()
    this.setData()
  },
  methods: {
    stopLoading: function () {
      this.$refs.dataGrid.instance.endCustomLoading()
      this.$emit('dataLoaded', null)
    },
    onExporting () {
      downloadUtils.downloadDxDataGridCSV(
        `${this.proteinAccession}_protease_map.csv`,
        this.$refs.dataGrid
      )
    },
    showErrorMessage (msg) {
      this.userErrorMessage = msg
      this.showSnackbar = true
    },
    setData: function () {
      this.$refs.dataGrid.instance.beginCustomLoading()
      axios.get(this.proteaseDataUrl)
        .then(data => data.data)
        .then(arr => {
          // Manually add protease name to available fields
          const data = arr.map(obj => {
            return {
              PROTEASE_NAME: this.proteaseIdToName[obj.PROTEASE_ID],
              ...obj
            }
          })
          this.dataSource = {
            store: {
              type: 'array',
              key: 'PROTEASE_NAME',
              data
            }
          }
          this.stopLoading()
        })
        .catch(e => {
          // Server currently fails e.g. when more than 10 proteases are selected
          this.$emit('loading-error', e.response.data.message)
          this.stopLoading()
        })
    },
    loadProteaseMappings: async function () {
      await axios.get(`${this.$store.state.host}/proteomicsdb/logic/getDigestionEnzymes.xsjs`).then(
        ({ data }) => {
          for (const protease of data) {
            this.proteaseNameToId[protease.NAME] = protease.ID
            this.proteaseIdToName[protease.ID] = protease.NAME
          }
        }
      )
    }
  }
}
</script>

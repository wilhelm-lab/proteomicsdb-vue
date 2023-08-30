<template>
  <v-container class="ic50-container">
    <IC50Plot
      v-if="b50PlotData"
      ref="plot"
      :curve-parameters="b50PlotData.parameter"
      :data-points="b50PlotData.data"
      :properties="b50PlotData.properties"
      :height="height"
      :width="width"
      :title="title"
    />
    <v-overlay
      :absolute="true"
      :value="loading"
      :opacity="0.3"
    >
      <v-progress-circular
        indeterminate
        size="32"
      />
    </v-overlay>
  </v-container>
</template>

<script>
import axios from 'axios'
import IC50Plot from './IC50Plot'

export default {
  name: 'SelectivityIC50Plot',
  components: {
    IC50Plot
  },
  props: {
    width: {
      type: Number,
      default: 200
    },
    height: {
      type: Number,
      default: 200
    },
    drug: {
      type: Object,
      default: () => {}
    },
    selectedProtein: {
      type: Object,
      default: () => {}
    }
  },
  data: function () {
    return {
      b50PlotData: null,
      loading: false
    }
  },
  computed: {
    /** @returns {string} */
    title: function () {
      return `Dose response curve for ${this.selectedProtein.GENE_NAME} using ${this.drug.TREATMENT}`
    }
  },
  watch: {
    drug: function () {
      this.loadData()
    },
    selectedProtein: function () {
      this.loadData()
    }
  },
  mounted: function () {
    this.loadData()
  },
  methods: {
    loadData: function () {
      this.loading = true
      axios.get(`${this.$store.state.host}/logic/getCurveInformationByProteinID.xsjs`, {
        params: {
          PROTEIN_ID: this.selectedProtein.PROTEIN_ID,
          DRUG_ID: this.drug.DRUG_ID,
          assay_type: 'PDB:101007',
          assay_variable: 'dose'
        }
      })
        .then(response => {
          this.b50PlotData = response.data[0]
        })
        .finally(() => {
          this.loading = false
        })
    },
    getSVG: function () {
      return this.$refs.plot.getSVG()
    }
  }
}
</script>

<style>
.ic50-container {
  padding: 0 !important;
}
</style>

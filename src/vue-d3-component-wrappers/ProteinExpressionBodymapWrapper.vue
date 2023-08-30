<template>
  <v-card elevation="0" class="protein-expression-bodymap-wrapper">
    <v-card-title v-if="showToolbar">
      <h2 class="text-h5">
        Protein Expression
      </h2>
    </v-card-title>
    <bodymap
      id="expressionBodymap"
      :data="bodyMapData"
      :selectedOrganism="selectedOrganism"
      :drawOnMount="drawOnMount"
      @organSelected="organSelected"
      @resetSelections="resetSelections"
      ref="bodymap"
      class="protein-expression-bodymap pt-2"
    />
  </v-card>
</template>

<script>
import axios from "axios";
import bodymap from "@/vue-d3-components/Bodymap";
import Helper from "@/vue-d3-component-wrappers/common-lib/Helper.js";

export default {
  components: {
    bodymap,
  },
  props: {
    minWidth: {
      type: Number,
      default: 400,
    },
    showToolbar: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "black",
    },
    drawOnMount: {
      type: Boolean,
      default: false,
    },
    proteinId: {
      type: String,
      default: null,
    },
    proteinAccession: {
      type: String,
      default: null,
    },
    omicsType: {
      type: String,
      default: null,
    },
    quantification: {
      type: String,
      default: null,
    },
    tissue_category: {
      type: String,
      default: null,
    },
    scope: {
      type: String,
      default: null,
    },
    group_by_tissue: {
      type: String,
      default: null,
    },
    calculation: {
      type: String,
      default: null,
    },
    selectedOrganism: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    bodyMapData: [],
  }),
  watch: {
    omicsType () {
        this.getData();
    },
    calculation () {
        this.getData();
    },
    tissue_category () {
        this.getData();
    },
    selectedOrganism () {
        this.getData();
    },
    scope () {
        this.getData();
    },	
    group_by_tissue () {
        this.getData();
    },
    proteinId () {
        this.getData();
    },
    quantification () {
        this.getData();
    },
  },
  methods: {
    getData () {
      if (this.tissue_category && this.tissue_category !== "") {

        let urlDatasets =
          this.$store.state.host +
          "/proteomicsdb/logic/getExpressionWrapper.xsjs";
        axios
          .get(urlDatasets, {
            params: {
              omics: this.omicsType,
              protein_id: this.proteinId,
              quantification: this.quantification,
              tissue_category: this.tissue_category,
              scope: this.scope,
              group_by_tissue: this.group_by_tissue,
              calculation: this.calculation,
            },
          })
          .then((response) => {
            this.bodyMapData = response.data;
            this.$emit("dataLoaded", response.data);
          });
      }
    },
    toggleOrgan: function (name) {
      this.$refs.bodymap.toggleOrgan(name);
    },
    resetSelections: function () {
      this.$emit("resetSelections", null);
    },
    organSelected: function (data) {
      this.$emit("organSelected", data);
    },
    getSVG: function () {
      return this.$refs.bodymap.getSVG();
    },
    getCSV: function () {
      var aColumnMapping = [];
      var title = "";
      if (this.omicsType === "Proteomics") {
        aColumnMapping = [
          {
            jsonProperty: "TISSUE_ID",
            columnName: "Tissue ID",
          },
          {
            jsonProperty: "TISSUE_NAME",
            columnName: "Tissue",
          },
          {
            jsonProperty: "SAP_SYNONYM",
            columnName: "Tissue Synonym",
          },
          {
            jsonProperty: "UNNORMALIZED_INTENSITY",
            columnName: "Average Unnormalized Intensity",
          },
          {
            jsonProperty: "NORMALIZED_INTENSITY",
            columnName: "Average Normalized Intensity",
          },
          {
            jsonProperty: "MAX_NORMALIZED_INTENSITY",
            columnName: "Maximum Normalized Intensity",
          },
          {
            jsonProperty: "MIN_NORMALIZED_INTENSITY",
            columnName: "Minimum Normalized Intensity",
          },
          {
            jsonProperty: "SAMPLES",
            columnName: "Number of Samples",
          },
        ];
        title = "Protein Expression: " + this.proteinAccession;
      } else {
        aColumnMapping = [
          {
            jsonProperty: "TISSUE_ID",
            columnName: "Tissue ID",
          },
          {
            jsonProperty: "TISSUE_NAME",
            columnName: "Tissue",
          },
          {
            jsonProperty: "SAP_SYNONYM",
            columnName: "Tissue Synonym",
          },
          {
            jsonProperty: "NORMALIZED_INTENSITY",
            columnName: "Average " + this.calculation,
          },
          {
            jsonProperty: "MAX_NORMALIZED_INTENSITY",
            columnName: "Maximum " + this.calculation,
          },
          {
            jsonProperty: "MIN_NORMALIZED_INTENSITY",
            columnName: "Minimum " + this.calculation,
          },
          {
            jsonProperty: "NUMBER_OF_SAMPLES",
            columnName: "Number of Samples",
          },
        ];
        title = "mRNA Expression: " + this.proteinAccession;
      }
      return Helper.downloadCsvFromJson(
        this.bodyMapData,
        title,
        aColumnMapping
      );
    },
  },
  mounted() {
    this.getData();
  },
};
</script>

<style lang="scss">
.protein-expression-bodymap-wrapper {
  overflow-x: auto;
  overflow-y: hidden;

  .protein-expression-bodymap {
    min-width: 600px;
  }
}

</style>
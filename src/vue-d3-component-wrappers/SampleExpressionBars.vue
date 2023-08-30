<template>
  <v-card elevation="0" class="overflow-y-auto">
    <expressionbars
      ref="expressionbarsref"
      :data="barData"
      :barAttributes="barAttributes"
      :svgAttributes="svgAttributes"
      @sampleBarSelected="barSelected"
    />
    <sampleInfoPopUp
      :openDialog="publicSampleSelected"
      :sampleId="selectedSampleId"
      :omics="omicsType"
      @closePopUp="resetSelectedSample"
    ></sampleInfoPopUp>
    <v-snackbar
      v-model="privateAlert"
    >
      {{ privateAlertText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          text
          class="white--text"
          v-bind="attrs"
          @click="privateAlert = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import expressionbars from "@/vue-d3-components/ExpressionBars";
import sampleInfoPopUp from "@/views/popup/SampleInfoPopUp";
import axios from "axios";
export default {
  components: {
    expressionbars,
    sampleInfoPopUp,
  },
  props: {
    minWidth: {
      type: Number,
      default: 400,
    },
    minHeight: {
      type: Number,
      default: 400,
    },
    data: {
      type: Array,
      default: () => [],
    },
    proteinId: {
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
    tissues_selected: {
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
  },
  data: function () {
    return {
      barAttributes: {
        x: 1,
        y: (d) => {
          console.log(this.omicsType)
          return this.omicsType === "Proteomics" ?
            `(${d.PROJECT_NAME}/${d.SAMPLE_NAME}) - ${d.TISSUE_NAME}`
            : d.TISSUE_NAME;
        },
        id: function id(d) {
          return d.SAMPLE_ID;
        },
        height: 16,
        width: function width(d) {
          return d.NORMALIZED_INTENSITY;
        },
        label: function label(d) {
          return d.TISSUE_ID;
        },
        tipsy: function tipsy(d) {
          var mouseOverLabel = d.EXPERIMENT_NAME;
          if (d.STATUS === "public") {
            mouseOverLabel = mouseOverLabel + " | " + d.SAMPLE_NAME;
          }
          if (d.SAP_SYNONYM) {
            mouseOverLabel =
              mouseOverLabel +
              "<hr>" +
              d.TISSUE_NAME +
              " | " +
              d.SAP_SYNONYM +
              " <hr>Intensity: " +
              d.NORMALIZED_INTENSITY.toFixed(2);
          } else {
            mouseOverLabel =
              mouseOverLabel +
              "<hr>" +
              d.TISSUE_NAME +
              " <hr>Intensity: " +
              d.NORMALIZED_INTENSITY.toFixed(2);
          }
          return mouseOverLabel;
        },
      },
      svgAttributes: {
        x_axis_label: "intensity (log2 top3)",
        y_axis_label: "samples",
        title: "Sample specific protein expression",
        width: 300,
        margin: {
          top: 55,
          left: 300,
          right: 20,
          bottom: 0,
          chart: {
            top: 0,
          },
        },
      },
      barData: [],
      privateAlert: false,
      privateAlertText: "Sorry - This data is not yet publicly available.",
      publicSampleSelected: false,
      selectedSampleId: null,
    };
  },
  watch: {
    data: function (newData) {
      if (this.proteinId === null && newData) {
        this.barData = newData;
      }
    },
    proteinId: function () {
      this.getData();
    },
    tissues_selected: function (sTissues) {
      if (sTissues !== "") {
        this.getData();
      }
    },
  },
  methods: {
    resetSelectedSample: function () {
      this.publicSampleSelected = false;
      this.selectedSampleId = null;
    },
    toggleBar: function (data) {
      this.$refs.expressionbarsref.toggleBar(data);
    },
    barSelected: function (data) {
      if (data.STATUS === "private") {
        this.privateAlert = true;
      } else {
        this.privateAlert = false;
        this.selectedSampleId = data.SAMPLE_ID;
        this.publicSampleSelected = true;
      }
    },
    getData: function () {
      let that = this;

      let urlDatasets =
        this.$store.state.host +
        "/proteomicsdb/logic/getExpressionWrapper.xsjs";
      axios
        .get(urlDatasets, {
          params: {
            protein_id: that.proteinId,
            quantification: that.quantification,
            tissue_category: that.tissue_category,
            tissues_selected: that.tissues_selected,
            scope: that.scope,
            omics: that.omicsType,
            group_by_tissue: that.group_by_tissue,
            calculation: that.calculation,
          },
        })
        .then(function (response) {
          that.barData = response.data;
        });
    },
    getSVG: function () {
      return this.$refs.expressionbarsref.getSVG();
    },
  },
  mounted() {
    if (this.tissues_selected !== "") {
      this.getData();
    }
  },
};
</script>

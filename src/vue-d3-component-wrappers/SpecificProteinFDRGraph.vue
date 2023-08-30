<template>
  <fdrplot
    ref="fdrRef"
    id="specificProteinFDR"
    :height="'300px'"
    :data="geneFdrModel"
    :targetName="targetName"
    :xAxisLabel="'Q-score'"
    :yAxisLabel="'# of PSMs'"
    :logY="true"
    :psmLevel="true"
  />
</template>

<script>
import axios from "axios";
import fdrplot from "@/vue-d3-components/FDRGraph";

export default {
  name: "specificProteinFdrPlot",
  components: {
    fdrplot: fdrplot,
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
    proteinId: {
      type: String,
      default: null,
    },
    targetName: {
      type: String,
      default: null,
    },
  },
  data: function () {
    return {
      geneFdrModel: null,
    };
  },
  methods: {
    getData: function () {
      let that = this;

      let urlDatasets =
        this.$store.state.host +
        "/proteomicsdb/logic/fdr/getProteinSpecificFDR.xsjs";
      axios
        .get(urlDatasets, {
          params: {
            proteinId: this.proteinId,
          },
        })
        .then(function (response) {
          that.geneFdrModel = response.data;
        });
    },
    getSVG: function () {
      return this.$refs.fdrRef.getSVG();
    },
  },
  mounted() {
    this.getData();
  },
};
</script>

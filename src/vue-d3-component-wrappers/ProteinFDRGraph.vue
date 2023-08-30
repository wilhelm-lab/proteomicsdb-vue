<template>
  <fdrplot
    ref="fdrRef"
    id="proteinFDR"
    :height="'300px'"
    :data="geneFdrModel"
    :targetName="targetName"
    :targetPosition="targetScore"
    :decoyPosition="decoyScore"
    :enrichment="enrichment"
    :qValue="qValue"
    :xAxisLabel="'protein score (best Q-score)'"
    :yAxisLabel="'# of proteins'"
  />
</template>

<script>
import axios from "axios";
import fdrplot from "@/vue-d3-components/FDRGraph";

export default {
  name: "proteinFdrPlot",
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
      targetScore: null,
      decoyScore: null,
      enrichment: null,
      qValue: null,
    };
  },
  methods: {
    getData: function () {
      let that = this;

      let urlDatasets =
        this.$store.state.host + "/proteomicsdb/logic/fdr/getProteinFDR.xsjs";
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
    getGeneScores: function () {
      let that = this;

      let urlDatasets =
        this.$store.state.host +
        "/proteomicsdb/logic/fdr/getProteinFDRScore.xsjs";
      axios
        .get(urlDatasets, {
          params: {
            proteinId: this.proteinId,
          },
        })
        .then(function (response) {
          that.targetScore = response.data.TARGET
            ? response.data.TARGET.SCORE
            : undefined;
          that.decoyScore = response.data.DECOY
            ? response.data.DECOY.SCORE
            : undefined;
          that.enrichment = response.data.enrichment;
          that.qValue = response.data.Q_VALUE;
        });
    },
    getSVG: function () {
      return this.$refs.fdrRef.getSVG();
    },
  },
  mounted() {
    this.getData();
    this.getGeneScores();
  },
};
</script>

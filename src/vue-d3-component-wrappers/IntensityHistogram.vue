<template>
  <histogram
    ref="histogram"
    v-if="chartData"
    id="intensityHistogram"
    :fullChartData="chartData"
    :selectedLines="selectedLines"
    :minHeight="minHeight"
    :minWidth="minWidth"
    :title="title"
    :xlabel="xlabel"
    :margin="histogramMargin"
    :plot-histogram="true"
    :plotKDE="true"
    :nHistogramBins="30"
  />
</template>

<script>
import histogram from "@/vue-d3-components/GenericHistogram";

export default {
  name: "intensityhistogram",
  components: {
    histogram: histogram,
  },
  props: {
    chartData: {
      type: Array,
      default: undefined
    },
    minWidth: {
      type: Number,
      default: 200,
    },
    minHeight: {
      type: Number,
      default: 200,
    },
    title: {
      type: String,
      default: "",
    },
    xlabel: {
      type: String,
      default: "",
    },
    // modelIds: {
    //   type: Array,
    //   default: () => [],
    // },
    selectedDataset: {
      type: Object,
      default: null,
    },
    selectedLines: {
      type: Array,
      default: null,
    },
  },
  data: function () {
    return {
      histogramMargin: {top: 20, right: 10, bottom: 50, left: 70}
    };
  },
  watch: {
    // modelIds: function () {
    //   this.getData();
    // },
    // selectedDataset: function () {
    //   this.getData();
    // },
  },
  methods: {
    getSVG: function () {
      return this.$refs.histogram.getSVG();
    },
    // getData: function () {
    //   let that = this;
    //   let urlCurveData =
    //     this.$store.state.host +
    //     "/proteomicsdb/logic/ptmCurves/getIntensityData.xsjs";
    //   if (this.selectedDataset) {
    //     axios
    //       .get(urlCurveData, {
    //         params: {
    //           experiment_design_id: this.selectedDataset.experimentDesignId,
    //         },
    //       })
    //       .then(function (response) {
    //         that.chartData = response.data;
    //       });
    //   } else {
    //     this.chartData = null;
    //   }
    // },
  },
};
</script>

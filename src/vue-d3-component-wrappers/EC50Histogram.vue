<template>
  <histogram
      ref="histogram"
      v-if="chartData"
      id="ec50Histogram"
      :fullChartData="allEC50Values"
      :filteredChartData="regulatedEC50Values"
      :fullTooltip="fullTooltip"
      :filteredTooltip="filteredTooltip"
      :plotHistogram="true"
      :plotKDE="true"
      :nHistogramBins="30"
      :selectedLines="selectedLines"
      :minHeight="minHeight"
      :minWidth="minWidth"
      :title="title"
      :xlabel="xlabel"
      :margin="histogramMargin"
      :minLineValue="Math.log10(minDose)"
      :maxLineValue="Math.log10(maxDose)"
      :minLineText="'1e' + parseFloat(Math.log10(this.minDose).toFixed(2))"
      :maxLineText="'1e' + parseFloat(Math.log10(this.maxDose).toFixed(2))"
      minLineLabel='Min Dose'
      maxLineLabel='Max Dose'
      :unit="doseUnit"
      :draw-min-max-lines="true"
      selectedLineTitlePrefix='pEC50 ='
      :changeSignOfSelectedLine="true"
  />
</template>

<script>
//import axios from "axios";
import histogram from "@/vue-d3-components/GenericHistogram";

export default {
  name: "ec50histogram",
  components: {
    histogram: histogram,
  },
  props: {
    chartData: {
      type: Array,
      default: undefined
    },
    ptmType: {
      type: String,
      default: ''
    },
    cellLine: {
      type: String,
      default: ''
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
    // selectedDataset: {
    //   type: Object,
    //   default: null,
    // },
    selectedLines: {
      type: Array,
      default: null,
    },
    minDose: {
      type: Number,
      default: null,
    },
    maxDose: {
      type: Number,
      default: null,
    },
    doseUnit: {
      type: String,
      default: '',
    },
    dataLevel: {
      type: String,
      default: 'Peptide',
    },
  },
  data: function () {
    return {
      histogramMargin: {top: 20, right: 10, bottom: 50, left: 70}
    };
  },
  computed: {
    //TODO: I think what arrives here is ALWAYS pEC50 (?). If that is true, rename it, if not find out why.
    /** @returns {Array} */
    allEC50Values() {
      return this.chartData.map(d => d.ec50)
    },
    /** @returns {Array} */
    regulatedEC50Values() {
      return this.chartData.filter(d => d.regulation !== 0).map(d => d.ec50)
    },
    /** @returns {string} */
    fullTooltip() {
      return `All Peptides (n=${this.allEC50Values.length})`
    },
    /** @returns {string} */
    filteredTooltip() {
      return `Regulated ${this.dataLevel}s (n=${this.regulatedEC50Values.length})`

    }

    // sModelIds: function () {
    //   return this.modelIds ? this.modelIds.join(";")
    //     : undefined;
    // },
  },
  watch: {
    // modelIds: function () {
    //   this.getData();
    // },
    // selectedDataset: function () {
    //   if(this.selectedDataset) {
    //     this.getDataExperimentCentric();
    //   } else{
    //     this.chartData = null;
    //   }
    // },
  },
  methods: {
    getSVG: function () {
      return this.$refs.histogram.getSVG();
    },
    // getDataExperimentCentric: function () {
    //   let urlCurveData =
    //       this.$store.state.host +
    //       "/proteomicsdb/logic/ptmCurves/getEC50Data.xsjs";
    //   axios
    //       .get(urlCurveData, {
    //         params: {
    //           experiment_design_id: this.selectedDataset.experimentDesignId,
    //           min_dose:
    //           this.selectedDataset.minDose,
    //           max_dose:
    //           this.selectedDataset.maxDose,
    //         },
    //       })
    //       .then((response) => {
    //         this.chartData = response.data;
    //       });
    // },
  },
};
</script>

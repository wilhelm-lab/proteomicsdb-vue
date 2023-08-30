<template>
  <v-card elevation="0" class="overflow-y-auto">
    <expressionbars
      ref="expressionbarsref"
      :data="data"
      :barAttributes="barAttributes"
      :svgAttributes="svgAttributes"
      @barSelected="barSelected"
    />
  </v-card>
</template>

<script>
import expressionbars from "@/vue-d3-components/ExpressionBars";

export default {
  components: {
    expressionbars,
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
  },
  data: function () {
    return {
      barAttributes: {
        x: 1,
        y: function y(d) {
          return d.TISSUE_NAME;
        },
        id: function id(d) {
          return d.TISSUE_ID + d.NORMALIZED_INTENSITY;
        },
        height: 16,
        width: function width(d) {
          return d.NORMALIZED_INTENSITY;
        },
        label: function label(d) {
          return d.TISSUE_ID;
        },
        tipsy: function tipsy(d) {
          var mouseOverLabel = "";
          if (d.SAP_SYNONYM) {
            mouseOverLabel = d.TISSUE_NAME + "<hr>";
          }
          mouseOverLabel =
            mouseOverLabel +
            "Id: " +
            d.TISSUE_ID +
            "<hr> Intensity: " +
            d.NORMALIZED_INTENSITY.toFixed(2);
          return mouseOverLabel;
        },
      },
      svgAttributes: {
        x_axis_label: "intensity (log2 top3)",
        y_axis_label: "tissues",
        title: "Median protein expression",
        width: 300,
        margin: {
          top: 55,
          left: 200,
          right: 20,
          bottom: 0,
          chart: {
            top: 0,
          },
        },
      },
    };
  },
  methods: {
    toggleBarTissueId: function (data) {
      this.$refs.expressionbarsref.toggleBarTissueId(data);
    },
    toggleBar: function (data) {
      this.$refs.expressionbarsref.toggleBar(data);
    },
    barSelected: function (data) {
      this.$emit("barSelected", data);
    },
    resetBarSelection: function () {
      this.$refs.expressionbarsref.resetBarSelection();
    },
    getSVG: function () {
      return this.$refs.expressionbarsref.getSVG();
    },
  },
  mounted() {},
};
</script>

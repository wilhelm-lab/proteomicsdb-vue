<template>
  <div>
    <ProteinDrugInteractionGraph
        ref="InteractionGraph"
        :graphData="graphData"
        :width="minWidth"
        :height="minHeight"
        :selectedDrugs="selectedDrugs"
        :catdsData="catdsData"
    />
  </div>
</template>

<script>
import ProteinDrugInteractionGraph from "@/vue-d3-components/ProteinDrugInteractionGraph";

export default {
  name: "proteindruginteractionwrapper",
  components: {
    ProteinDrugInteractionGraph
  },
  props: {
    minWidth: {
      type: Number,
      default: 500,
    },
    minHeight: {
      type: Number,
      default: 500,
    },
    graphData: {
      type: Object,
      default: () => {
      }
    },
    selectedDrugs: {
      type: Array,
      default: () => []
    },
    catdsData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  methods: {
    getSVG: function () {
      return this.$refs.InteractionGraph.getSVG()
    }
  },
};
</script>

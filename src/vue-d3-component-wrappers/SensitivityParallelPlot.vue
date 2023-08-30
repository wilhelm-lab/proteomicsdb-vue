<template>
  <div>
    <parallelplot
      :chartData="violinModel"
      :plotWidth="minWidth"
      :plotHeight="minHeight"
      v-on="$listeners"
    />
    <v-btn @click="$emit('selectedLinesChange','')">
      <v-icon left>mdi-close</v-icon>
      Clear Filter
    </v-btn>
  </div>
</template>

<script>
import parallelplot from "@/vue-d3-components/D3ParallelGeneric";

export default {
  name: "sensitivityparallelplot",
  components: {
    parallelplot: parallelplot,
  },
  props: {
    minWidth: {
      type: Number,
      default: 200,
    },
    minHeight: {
      type: Number,
      default: 200,
    },
    violinModel: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
  },
};
</script>

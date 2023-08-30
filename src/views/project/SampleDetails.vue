<template>
  <v-row class="mt-2">
    <v-col cols="reducedView ? 4 : 3">
      <TheProjectExperimentSampleInfo
        :sample-id="sampleId"
        :omics="omicsType"
      />
    </v-col>
    <v-col>
      <TheProjectExperimentSampleFilesTable :sample-id="sampleId" />
    </v-col>
  </v-row>
</template>

<script>
import TheProjectExperimentSampleInfo from '../../components/partials/project/experiment/sample/TheProjectExperimentSampleInfo'
import TheProjectExperimentSampleFilesTable from '../../components/partials/project/experiment/sample/TheProjectExperimentSampleFilesTable'

export default {
  components: {
    TheProjectExperimentSampleInfo,
    TheProjectExperimentSampleFilesTable
  },
  data: () => ({
    omicsType: 'Proteomics'
  }),
  computed: {
    /** @returns {string} */
    sampleId () {
      return this.$route.params.sampleId.toString()
    }
  }
}
</script>

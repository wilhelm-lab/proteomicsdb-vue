<template>
  <div>
    <LoadingOverlay :loading="loading" />

    <v-simple-table class="mb-8">
      <template #default>
        <tbody>
          <tr>
            <td>Project Name:</td>
            <td>{{ experiment.PROJECT_NAME }}</td>
          </tr>
          <tr>
            <td>Experiment ID:</td>
            <td>{{ experiment.EXPERIMENT_ID }}</td>
          </tr>
          <tr>
            <td>Experiment Name:</td>
            <td>{{ experiment.NAME }}</td>
          </tr>
          <tr>
            <td>Description:</td>
            <td>{{ experiment.DESCRIPTION }}</td>
          </tr>
          <tr>
            <td>Scope:</td>
            <td>{{ experiment.SCOPE }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-card
      v-if="expDesignExists"
      elevation="0"
      class="mb-8"
    >
      <v-card-title>Experiment Designs</v-card-title>
      <TheProjectExperimentDesignsTable
        :project-id="$route.params.projectId.toString()"
        :experiment-id="$route.params.experimentId.toString()"
      />
    </v-card>

    <v-card
      elevation="0"
    >
      <v-card-title>Samples</v-card-title>

      <TheProjectExperimentSamplesTable
        :data-in="samples"
        :project-id="$route.params.projectId.toString()"
        :experiment-id="$route.params.experimentId.toString()"
      />
    </v-card>
  </div>
</template>

<script>
import axios from 'axios'

import LoadingOverlay from '../../components/LoadingOverlay'
import TheProjectExperimentSamplesTable from '../../components/partials/project/experiment/TheProjectExperimentSamplesTable'
import TheProjectExperimentDesignsTable from '../../components/partials/project/experiment/TheProjectExperimentDesignsTable'

export default {
  components: {
    LoadingOverlay,
    TheProjectExperimentSamplesTable,
    TheProjectExperimentDesignsTable
  },
  data: () => ({
    loading: false,
    samples: null,
    expDesignExists: false,
    expDesignId: null,
    experiment: {
      PROJECT_NAME: '',
      EXPERIMENT_ID: '',
      NAME: '',
      DESCRIPTION: '',
      SCOPE: ''
    }
  }),
  async created () {
    this.loading = true

    await Promise.all([
      this.fetchSamples(),
      this.fetchExperiment(),
      this.fetchExpDesignExists()
    ])

    this.loading = false
  },
  methods: {
    async fetchSamples () {
      const url = this.$store.state.host + `/proteomicsdb/logic/api_v2/api.xsodata/Experiment(${this.$route.params.experimentId})/Sample?$format=json`
      const response = await axios.get(url)
      this.samples = response.data.d.results
    },
    async fetchExperiment () {
      const urlExperiment = this.$store.state.host + `/proteomicsdb/logic/api_v2/api.xsodata/Experiment(${this.$route.params.experimentId})?$format=json`
      const responseExperiment = await axios.get(urlExperiment)
      const experiment = responseExperiment.data.d

      const urlProject = this.$store.state.host + `/proteomicsdb/logic/api_v2/api.xsodata/Project(${this.$route.params.projectId})?$format=json`
      const responseProject = await axios.get(urlProject)
      experiment.PROJECT_NAME = responseProject.data.d.NAME
      this.experiment = experiment
    },
    async fetchExpDesignExists () {
      const response = await axios.get(this.$store.state.host + '/proteomicsdb/logic/experimentalDesign/getExpDesignExistence.xsjs', {
        params: {
          projectId: this.$route.params.projectId,
          experimentId: this.$route.params.experimentId
        }
      })

      this.expDesignExists = response.data.exists
    }
  }
}
</script>

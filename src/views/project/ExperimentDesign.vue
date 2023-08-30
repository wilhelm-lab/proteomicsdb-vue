<template>
  <div>
    <LoadingOverlay :loading="loading" />

    <v-card
      elevation="0"
      class="mb-8"
    >
      <v-card-title>Experiment design: {{ expDesign.name }}</v-card-title>
      <v-card-text>
        <v-simple-table>
          <template #default>
            <tbody>
              <tr>
                <td>Description</td><td>{{ expDesign.description }}</td>
              </tr>
              <tr>
                <td>Experiment</td>
                <td>{{ experiment.NAME }}</td>
              </tr>
              <tr>
                <td>Project</td>
                <td>{{ experiment.Project.NAME }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>

    <TheProjectExperimentDesignOutline
      :experiment-design="expDesign"
      :project-id="projectId"
      :experiment-id="experimentId"
    />
  </div>
</template>

<script>
import axios from 'axios'

import LoadingOverlay from '../../components/LoadingOverlay'
import TheProjectExperimentDesignOutline from '../../components/partials/project/experiment/design/TheProjectExperimentDesignOutline'

export default {
  components: {
    LoadingOverlay,
    TheProjectExperimentDesignOutline
  },
  data: () => ({
    loading: false,
    expDesign: {},
    experiment: {
      Project: {}
    }
  }),
  computed: {
    /** @returns {string} */
    projectId () {
      return this.$route.params.projectId
    },
    /** @returns {string} */
    experimentId () {
      return this.$route.params.experimentId
    },
    /** @returns {string} */
    expDesignId () {
      return this.$route.params.expDesignId
    }
  },
  async created () {
    this.loading = true

    await Promise.all([
      this.fetchExpDesign(),
      this.fetchExperiment()
    ])

    this.loading = false
  },
  methods: {
    async fetchExpDesign () {
      const response = await axios.get(`${this.$store.state.host}/proteomicsdb/logic/experimentalDesign/getExperimentalDesign.xsjs`, {
        params: {
          projectId: this.projectId,
          experimentId: this.experimentId,
          expDesignId: this.expDesignId
        }
      })

      this.expDesign = response.data
    },
    async fetchExperiment () {
      const response = await axios.get(
        `${this.$store.state.host}/proteomicsdb/logic/api_v2/api.xsodata/Experiment(${this.experimentId})`,
        {
          params: {
            $format: 'json',
            $expand: 'Project',
            $select: 'NAME,EXPERIMENT_ID,PROJECT_ID,Project/NAME'
          }
        }
      )
      this.experiment = response.data.d
    }
  }
}
</script>

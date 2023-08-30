<template>
  <v-breadcrumbs>
    <v-breadcrumbs-item
      v-for="item in [...breadcrumbItems]"
      :key="item.key"
      :to="item.to"
      exact
      exact-active-class="v-breadcrumbs__item--exact-active"
    >
      <v-icon class="mr-1">
        mdi mdi-chevron-right
      </v-icon>
      {{ item.text }}
    </v-breadcrumbs-item>
  </v-breadcrumbs>
</template>>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      breadcrumbItems: []
    }
  },
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
    sampleId () {
      return this.$route.params.sampleId
    },
    expDesignId () {
      return this.$route.params.expDesignId
    }
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      async handler () {
        if (this.$route.name === 'projectHome') {
          this.breadcrumbItems = []
        } else if (this.$route.name === 'project') {
          this.breadcrumbItems = [await this.fetchProjectCrumb(this.projectId)]
        } else if (this.$route.name === 'projectExperiment') {
          this.breadcrumbItems = [
            await this.fetchProjectCrumb(this.projectId),
            await this.fetchExperimentCrumb(this.experimentId)
          ]
        } else if (this.$route.name === 'projectExperimentSample') {
          this.breadcrumbItems = [
            await this.fetchProjectCrumb(this.projectId),
            await this.fetchExperimentCrumb(this.experimentId),
            await this.fetchSampleCrumb(this.sampleId)
          ]
        } else if (this.$route.name === 'projectExperimentDesign') {
          this.breadcrumbItems = [
            await this.fetchProjectCrumb(this.projectId),
            await this.fetchExperimentCrumb(this.experimentId),
            await this.fetchExpDesignCrumb(this.expDesignId)
          ]
        }
      }
    }
  },
  methods: {
    async fetchProjectCrumb () {
      const response = await axios.get(
        `${this.$store.state.host}/proteomicsdb/logic/api_v2/api.xsodata/Project(${this.projectId})?$format=json`
      )
      return ({
        text: 'PROJECT: ' + response.data.d.NAME,
        to: { name: 'project', params: { projectId: this.projectId } },
        key: `project-${this.projectId}`
      })
    },
    async fetchExperimentCrumb () {
      const response = await axios.get(
        `${this.$store.state.host}/proteomicsdb/logic/api_v2/api.xsodata/Experiment(${this.experimentId})?$format=json`
      )
      return ({
        text: 'EXPERIMENT: ' + response.data.d.NAME,
        to: {
          name: 'projectExperiment',
          params: {
            projectId: this.projectId,
            experimentId: this.experimentId
          }
        },
        key: `experiment-${this.experimentId}`
      })
    },
    async fetchSampleCrumb () {
      const response = await axios.get(
        `${this.$store.state.host}/proteomicsdb/logic/api_v2/api.xsodata/Sample(${this.sampleId})?$format=json`
      )
      return ({
        text: 'SAMPLE: ' + response.data.d.NAME,
        to: {
          name: 'projectExperimentSample',
          params: {
            projectId: this.projectId,
            experimentId: this.experimentId,
            sampleId: this.sampleId
          }
        },
        key: `sample-${this.sampleId}`
      })
    },
    async fetchExpDesignCrumb () {
      const response = await axios.get(`${this.$store.state.host}/proteomicsdb/logic/experimentalDesign/getExperimentalDesign.xsjs`, {
        params: {
          projectId: this.projectId,
          experimentId: this.experimentId,
          expDesignId: this.expDesignId
        }
      })

      return ({
        text: `DESIGN: ${response.data.name}`,
        to: {
          name: 'projectExperimentDesign',
          params: {
            projectId: this.projectId,
            experimentId: this.experimentId,
            expDesignId: this.expDesignId
          }
        },
        key: `design-${this.expDesignId}`
      })
    }
  }
}
</script>

<style>
.v-application .theme--light.v-breadcrumbs .v-breadcrumbs__item--exact-active {
  color: rgba(0,0,0,.87);
}
</style>

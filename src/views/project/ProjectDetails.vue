<template>
  <div>
    <LoadingOverlay :loading="loading" />

    <v-simple-table class="mb-8">
      <template #default>
        <tbody>
          <tr>
            <td>ID:</td>
            <td>{{ projectIdentifier }}</td>
          </tr>
          <tr>
            <td>Name:</td>
            <td>{{ projectName }}</td>
          </tr>
          <tr>
            <td>Details:</td>
            <td>{{ projectDetails }}</td>
          </tr>
          <tr>
            <td>Pubmed ID:</td>
            <td>{{ projectPubmedId }}</td>
          </tr>
          <tr>
            <td>ProteomeXchange:</td>
            <td>
              <a
                v-if="projectHasPubmedId"
                :href="projectProteomeExchangeUrl"
              >{{ projectProteomeExchangeUrl }}</a>
              <span v-else>n/a</span>
            </td>
          </tr>
          <tr>
            <td>Owner:</td>
            <td>{{ projectOwner }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-card
      elevation="0"
    >
      <v-toolbar
        elevation="0"
        dense
      >
        <v-toolbar-title>Experiments</v-toolbar-title>
      </v-toolbar>

      <TheProjectExperimentsTable
        :project-experiments="projectExperiments"
        :project-id="projectId"
      />
    </v-card>
  </div>
</template>

<script>
import axios from 'axios'

import dateFromEdmString from '../../utils/dateConversion'

import TheProjectExperimentsTable from '../../components/partials/project/TheProjectExperimentsTable'
import LoadingOverlay from '../../components/LoadingOverlay'

export default {
  components: {
    TheProjectExperimentsTable,
    LoadingOverlay
  },
  data: () => ({
    loading: true,
    projectId: '',
    projectIdentifier: '',
    projectName: '',
    projectDetails: '',
    projectPubmedId: 'n/a',
    projectOwner: '',
    projectExperiments: null,
    noDataText: 'No experiments found'
  }),
  computed: {
    /** @returns {boolean} */
    projectHasPubmedId () {
      return this.projectPubmedId !== 'n/a'
    },
    /** @returns {string} */
    projectProteomeExchangeUrl () {
      return `http://proteomecentral.proteomexchange.org/cgi/GetDataset?filterstr=${this.projectPubmedId}`
    }
  },
  async created () {
    this.projectId = this.$route.params.projectId.toString()
    this.loading = true
    await Promise.all([
      this.fetchProjectInfo(),
      this.fetchExperimentInfo()
    ])
    this.loading = false
  },
  methods: {
    async fetchProjectInfo () {
      const url = this.$store.state.host + `/proteomicsdb/logic/api_v2/api.xsodata/Project(${this.projectId})?$format=json`
      const response = await axios.get(url)
      const projectDetails = response.data.d

      const projectId = (projectDetails.PROJECT_ID).toString()
      const zeroRepeats = 6 - projectId.length

      this.projectIdentifier = 'PRDB' + '0'.repeat(zeroRepeats) + projectId
      this.projectName = projectDetails.NAME
      this.projectDetails = projectDetails.DESCRIPTION
      this.projectPubmedId = projectDetails.PUBMEDID ? projectDetails.PUBMEDID : 'n/a'
      this.projectOwner = projectDetails.OWNER
    },
    async fetchExperimentInfo () {
      const url = this.$store.state.host + `/proteomicsdb/logic/api_v2/api.xsodata/Project(${this.projectId})/Experiment?$format=json`
      const response = await axios.get(url)

      this.projectExperiments = response.data.d.results.map(this.formatDate)
    },
    formatDate (entry) {
      if (entry.CREATIONDATE) {
        entry.CREATIONDATE = dateFromEdmString(entry.CREATIONDATE)
      }

      if (entry.MODIFDATE) {
        entry.MODIFDATE = dateFromEdmString(entry.MODIFDATE)
      }

      return entry
    }
  }
}
</script>

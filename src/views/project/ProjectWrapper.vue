<template>
  <div>
    <v-main>
      <LoadingOverlay :loading="loading" />

      <the-project-breadcrumbs />

      <v-container
        v-if="isProjectHomePage"
      >
        <v-card
          elevation="0"
        >
          <v-toolbar
            elevation="0"
            dense
          >
            <v-toolbar-title>Projects</v-toolbar-title>
          </v-toolbar>

          <the-project-table
            :data-in="projects"
            @selection-changed="onSelectionChanged"
          />
        </v-card>
      </v-container>
      <v-container v-else>
        <router-view />
      </v-container>
    </v-main>
  </div>
</template>

<script>
// TODO: add store to deduplicate data fetching (e.g. breadcrumbs)
import axios from 'axios'
import router from '@/router'
import { mapState } from 'vuex'
import dateFromEdmString from '../../utils/dateConversion'

import LoadingOverlay from '../../components/LoadingOverlay'
import TheProjectTable from '../../components/partials/project/TheProjectTable'
import TheProjectBreadcrumbs from '../../components/partials/project/TheProjectBreadcrumbs'

export default {
  components: {
    LoadingOverlay,
    TheProjectTable,
    TheProjectBreadcrumbs
  },
  data: () => ({
    loading: false,
    projects: null

  }),
  computed: {
    ...mapState({
      organismTaxcode: state => state.organismTaxcode
    }),
    /** @returns {boolean} */
    isProjectHomePage () {
      return this.$route.name === 'projectHome'
    }
  },
  watch: {
    organismTaxcode () {
      this.fetchProjects()
    }
  },
  async created () {
    this.loading = true
    await this.fetchProjects()
    this.loading = false
  },
  methods: {
    onSelectionChanged: function (row) {
      const rawProjectId = row.data.PROJECT_ID.substr(4).replace(/^0+/, '')
      router.push({ name: 'project', params: { projectId: rawProjectId } })
    },
    async fetchProjects () {
      const resp = await axios.get(`${this.$store.state.host}/proteomicsdb/logic/repository/repository.xsodata/ProjectsOrganism(selectedTaxcode='${this.$store.state.organismTaxcode}')/Results?$format=json`)
      this.projects = Object.values(resp.data.d.results.map(this.formatDate))
      this.formatProjectIds()
    },
    formatProjectIds: function () {
      for (let i = 0; i < this.projects.length; i++) {
        const projectId = this.projects[i].PROJECT_ID.toString()
        const zeroRepeats = 6 - projectId.length
        this.projects[i].PROJECT_ID = 'PRDB' + '0'.repeat(zeroRepeats) + projectId
      }
    },
    formatDate: function (entry) {
      entry.CREATIONDATE = dateFromEdmString(entry.CREATIONDATE)
      entry.MODIFDATE = dateFromEdmString(entry.MODIFDATE)
      return entry
    }
  }
}
</script>

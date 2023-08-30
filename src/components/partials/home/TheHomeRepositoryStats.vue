<template>
  <div>
    <v-simple-table dense>
      <tbody v-if="hasData">
        <tr>
          <td>Projects:</td>
          <td>
            {{ statistics.PROJECT_COUNT }}
          </td>
        </tr>
        <tr>
          <td>Experiments:</td>
          <td>
            {{ statistics.EXPERIMENT_COUNT }}
          </td>
        </tr>
      </tbody>
    </v-simple-table>

    <div class="pa-4">
      <h4 class="text-h6">
        Recently Uploaded Projects
      </h4>
      <router-link
        v-for="project of statistics.RECENT_PROJECTS"
        :key="project.PROJECT_ID"
        class="d-block"
        :to="{ name: 'project', params: { projectId: project.PROJECT_ID } }"
      >
        {{ project.NAME }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      /** @returns {{
            EXPERIMENT_COUNT: number,
            PROJECT_COUNT: number,
            RECENT_PROJECTS: {
              PROJECT_ID: number,
              NAME: string
            }[],
          }}
       */
      statistics: state => state.statistics.statistics
    }),
    ...mapGetters({
      /** @returns {boolean} */
      hasData: 'statistics/hasData'
    })
  },
  created () {
    this.fetchStatistics()
  },
  methods: {
    ...mapActions({
      fetchStatistics: 'statistics/fetchStatistics'
    })
  }
}
</script>

<style>

</style>

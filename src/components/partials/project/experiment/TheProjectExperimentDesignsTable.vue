<template>
  <v-simple-table>
    <template #default>
      <thead>
        <tr>
          <th class="text-left">
            Name
          </th>
          <th class="text-left">
            Description
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="expDesign in expDesigns"
          :key="expDesign.ID"
        >
          <td>{{ expDesign.name }}</td>
          <td>{{ expDesign.description }}</td>
          <td>
            <v-btn
              :to="getExpDesignRoute(expDesign.ID)"
              text
              color="primary"
            >
              View Design
              <v-icon right>
                mdi-arrow-top-right
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import axios from 'axios'

export default {
  props: {
    projectId: {
      type: String,
      required: true
    },
    experimentId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    expDesignPermissions: [],
    expDesigns: []
  }),
  async created () {
    await this.fetchExpDesigns()
  },
  methods: {
    async fetchExpDesigns () {
      const response = await axios.get(`${this.$store.state.host}/proteomicsdb/logic/experimentalDesign/getExperimentalDesignNames.xsjs`, {
        params: {
          projectId: this.projectId,
          experimentId: this.experimentId
        }
      })

      this.expDesigns = response.data
    },
    getExpDesignRoute (expDesignId) {
      return {
        name: 'projectExperimentDesign',
        params: {
          projectId: this.projectId,
          experimentId: this.experimentId,
          expDesignId
        }
      }
    }
  }
}
</script>

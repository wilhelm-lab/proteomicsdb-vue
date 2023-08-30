<template>
  <v-card elevation="0">
    <LoadingOverlay :loading="loading" />

    <v-card-title>Sample Summary: {{ data.NAME }}</v-card-title>

    <v-card-text>
      <v-simple-table class="sample-details-table">
        <template #default>
          <tbody>
            <tr>
              <td>Sample Description</td>
              <td>{{ data.DESCRIPTION }}</td>
            </tr>
            <tr>
              <td>
                <router-link :to="experimentRoute">
                  Experiment
                </router-link>
              </td>
              <td>
                <v-simple-table
                  dense
                  class="sample-details-nested-table"
                >
                  <template #default>
                    <tbody>
                      <tr>
                        <td>Name</td>
                        <td>{{ data.EXPERIMENT }}</td>
                      </tr>
                      <tr>
                        <td>Description</td>
                        <td>{{ data.EXPERIMENT_DESCRIPTION }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </td>
            </tr>
            <tr>
              <td>
                <router-link :to="projectRoute">
                  Project
                </router-link>
              </td>
              <td>
                <v-simple-table
                  dense
                  class="sample-details-nested-table"
                >
                  <template #default>
                    <tbody>
                      <tr>
                        <td>Name</td>
                        <td>{{ data.PROJECT }}</td>
                      </tr>
                      <tr>
                        <td>Description</td>
                        <td>{{ data.PROJECT_DESCRIPTION }}</td>
                      </tr>
                      <tr v-if="omics === 'Proteomics'">
                        <td>Status</td>
                        <td>{{ data.STATUS }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </td>
            </tr>
            <tr>
              <td>Species</td>
              <td>{{ data.SPECIES_LONG }} ({{ data.SPECIES }})</td>
            </tr>
            <tr v-if="omics === 'Proteomics'">
              <td>User defined tissue</td>
              <td>{{ data.USER_TISSUE }}</td>
            </tr>
            <tr>
              <td>Tissue</td>
              <td>{{ data.TISSUE }}</td>
            </tr>
            <template v-if="omics === 'Proteomics'">
              <tr>
                <td>Treatment</td>
                <td>
                  <v-simple-table
                    dense
                    class="sample-details-nested-table"
                  >
                    <template #default>
                      <tbody>
                        <tr>
                          <td>Name</td>
                          <td>{{ data.TREATMENT }}</td>
                        </tr>
                        <tr>
                          <td>Details</td>
                          <td>{{ data.TREATMENT_DETAILS }}</td>
                        </tr>
                        <tr>
                          <td>Agent</td>
                          <td>{{ data.TREATMENT_AGENT }}</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </td>
              </tr>
              <tr>
                <td>Disease</td>
                <td>{{ data.USER_DISEASE }}</td>
              </tr>
              <tr>
                <td>Cell extract</td>
                <td>{{ data.CELL_EXTRACT }}</td>
              </tr>
              <tr>
                <td>Electrophoresis</td>
                <td>{{ data.ELECTROPHORESIS }}</td>
              </tr>
            </template>
            <tr v-if="omics == 'Transcriptomics'">
              <td>Quantification method</td>
              <td>{{ data.QUANTIFICATION_METHOD }}</td>
            </tr>
            <template v-if="omics === 'Proteomics'">
              <tr>
                <td>Chromatography</td>
                <td>
                  <v-simple-table
                    dense
                    class="sample-details-nested-table"
                  >
                    <template #default>
                      <tbody>
                        <tr>
                          <td>1st</td>
                          <td>{{ data.CHROMATOGRAPHY_1 }}</td>
                        </tr>
                        <tr>
                          <td>2nd</td>
                          <td>{{ data.CHROMATOGRAPHY_2 }}</td>
                        </tr>
                        <tr>
                          <td>3rd</td>
                          <td>{{ data.CHROMATOGRAPHY_3 }}</td>
                        </tr>
                        <tr>
                          <td>4th</td>
                          <td>{{ data.CHROMATOGRAPHY_4 }}</td>
                        </tr>
                        <tr>
                          <td>5th</td>
                          <td>{{ data.CHROMATOGRAPHY_5 }}</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </td>
              </tr>
              <tr>
                <td>Covalent Purification</td>
                <td>{{ data.COVALENT_PURIFICATION }}</td>
              </tr>
              <tr>
                <td>Affinity Purification</td>
                <td>{{ data.AFFINITY_PURIFICATION }}</td>
              </tr>
              <tr>
                <td>Quantification Method</td>
                <td>{{ data.QUANTIFICATION_METHOD }}</td>
              </tr>
              <tr>
                <td>Quantification Channel</td>
                <td>{{ data.QUANTIFICATION_CHANNEL }}</td>
              </tr>
              <tr>
                <td>Protein Digestion Method</td>
                <td>{{ data.PROTEIN_DIGESTION_METHOD }}</td>
              </tr>
              <tr>
                <td>Protease</td>
                <td>{{ data.PROTEASE }}</td>
              </tr>
              <tr>
                <td>Online LC System</td>
                <td>{{ data.ONLINE_LIQUID_CHROMATOGRAPHY_SYSTEM }}</td>
              </tr>
              <tr>
                <td>Mass Spectrometer</td>
                <td>
                  <v-simple-table
                    dense
                    class="sample-details-nested-table"
                  >
                    <template #default>
                      <tbody>
                        <tr>
                          <td>Model</td>
                          <td>{{ data.MASS_SPECTROMETER }}</td>
                        </tr>
                        <tr>
                          <td>MS Resolution</td>
                          <td>{{ data.MS_RESOLUTION }}</td>
                        </tr>
                        <tr>
                          <td>MSMS Resolution</td>
                          <td>{{ data.MSMS_RESOLUTION }}</td>
                        </tr>
                        <tr>
                          <td>Fragmentation Method</td>
                          <td>{{ data.FRAGMENTATION_METHOD }}</td>
                        </tr>
                        <tr>
                          <td>MS Detector</td>
                          <td>{{ data.MS_DETECTOR }}</td>
                        </tr>
                        <tr>
                          <td>MSMS Detector</td>
                          <td>{{ data.MSMS_DETECTOR }}</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </td>
              </tr>
              <tr>
                <td>Acquisition Mode</td>
                <td>{{ data.ACQUISITION_MODE }}</td>
              </tr>
            </template>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios'

import LoadingOverlay from '../../../../LoadingOverlay'

export default {
  components: {
    LoadingOverlay
  },
  props: {
    sampleId: {
      type: String,
      default: ''
    },
    omics: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    loading: false,
    data: {}
  }),
  computed: {
    /**
     * @typedef {import('vue-router').Route} Route
     * @returns {Route}
     */
    projectRoute () {
      return {
        name: 'project',
        params: {
          projectId: this.data.PROJECT_ID || 0
        }
      }
    },
    /** @returns {Route} */
    experimentRoute () {
      return {
        name: 'projectExperiment',
        params: {
          projectId: this.data.PROJECT_ID || 0,
          experimentId: this.data.EXPERIMENT_ID || 0
        }
      }
    }
  },
  async created () {
    this.loading = true
    await this.fetchData()
    this.loading = false
  },
  methods: {
    async fetchData () {
      const response = await axios.get(this.$store.state.host + '/proteomicsdb/logic/getSampleInfo.xsjs', {
        params: {
          sampleId: this.sampleId,
          omics: this.omics
        }
      })

      this.data = response.data
    }
  }
}
</script>

<style scoped lang="scss">
.sample-details-table {
  &.v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    font-size: 1rem;
  }
}

.sample-details-nested-table {
    margin: 0.5rem 0;
}
</style>

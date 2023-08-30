<template>
  <v-row v-if="hasData">
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <download-speed-dial
          top
          :disabled="tabLoading"
          right
          direction="left"
          csv
          @csv="getCSV"
        />
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-row>
        <v-col
          cols="12"
          lg="3"
        >
          <v-card elevation="0">
            <v-card-title>
              <h2 class="text-h5">
                Filter Criteria
              </h2>
            </v-card-title>
            <v-card-text>
              <v-combobox
                v-model="selectedProteases"
                small-chips
                multiple
                deletable-chips
                outlined
                hide-details
                label="Select Proteases"
                :items="allowedProteases"
                item-text="text"
                return-object
                item-value="text"
                class="mb-2"
              />
              <v-row class="ma-0">
                <v-btn
                  small
                  elevation="0"
                  color="grey lighten-2"
                  @click="selectedProteases=allowedProteases"
                >
                  Select All
                </v-btn>
                <v-spacer />
                <v-btn
                  small
                  elevation="0"
                  outlined
                  color="grey darken-2"
                  @click="selectedProteases=[]"
                >
                  Deselect All
                </v-btn>
              </v-row>
              <v-row>
                <v-col>
                  <v-subheader class="pl-0">
                    Peptide Length
                  </v-subheader>
                  <v-range-slider
                    v-model="selectedPeptideLengthRange"
                    :max="maxPeptideLength"
                    :min="minPeptideLength"
                    thumb-label
                    class="protease-map-range-slider"
                  >
                    <template #prepend>
                      <v-text-field
                        v-model.number="selectedPeptideLengthMin"
                        hide-details
                        outlined
                        dense
                        type="number"
                        class="protease-map-number-input"
                      />
                    </template>
                    <template #append>
                      <v-text-field
                        v-model.number="selectedPeptideLengthMax"
                        hide-details
                        outlined
                        dense
                        type="number"
                        class="protease-map-number-input"
                      />
                    </template>
                  </v-range-slider>
                </v-col>
              </v-row>
              <v-row class="mt-0">
                <v-col>
                  <v-subheader class="pl-0">
                    Peptide Mass [Da]
                  </v-subheader>
                  <v-range-slider
                    v-model="selectedPeptideMassRange"
                    :max="maxPeptideMass"
                    :min="minPeptideMass"
                    thumb-label
                    class="protease-map-range-slider"
                  >
                    <template #prepend>
                      <v-text-field
                        v-model.number="selectedPeptideMassMin"
                        hide-details
                        outlined
                        dense
                        type="number"
                        :max="maxPeptideMass"
                        :min="minPeptideMass"
                        class="protease-map-number-input"
                      />
                    </template>
                    <template #append>
                      <v-text-field
                        v-model.number="selectedPeptideMassMax"
                        hide-details
                        outlined
                        dense
                        type="number"
                        :max="maxPeptideMass"
                        :min="minPeptideMass"
                        class="protease-map-number-input"
                      />
                    </template>
                  </v-range-slider>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-subheader class="pl-0">
                    Missed Cleavages
                  </v-subheader>
                  <v-slider
                    v-model="selectedMissedCleavages"
                    class="align-center"
                    :min="minMissedCleavages"
                    :max="maxMissedCleavages"
                    hide-details
                  >
                    <template #append>
                      <v-text-field
                        v-model="selectedMissedCleavages"
                        hide-details
                        outlined
                        dense
                        class="protease-map-number-input"
                      />
                    </template>
                  </v-slider>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                :disabled="!selectedProteases || selectedProteases.length === 0"
                @click="load"
              >
                Load
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          lg="9"
        >
          <v-card elevation="0">
            <loading-overlay :loading="protvistaLoading" />
            <protvista-proteomicsdb-container
              v-if="!isError && !tabLoading && isConfigUrlSet"
              :accession="proteinInfo.uniprotId"
              :config-url="configUrl"
              expanded
              nostructure
              @protvista-proteomicsdb-loaded="handleProtvistaLoaded"
            />
            <v-alert
              v-else
              color="blue-grey"
              text
              icon="mdi-arrow-left"
            >
              Select proteases on the left to show the corresponding protease map for the current protein.
            </v-alert>
          </v-card>
          <v-card elevation="0">
            <the-protease-map-table
              v-if="!isError && !protvistaLoading && !tabLoading && isConfigUrlSet"
              ref="proteaseMapTable"
              :protein-id="proteinId"
              :protein-accession="proteinInfo.uniprotId"
              :min-length="selectedPeptideLengthMin"
              :max-length="selectedPeptideLengthMax"
              :min-mass="selectedPeptideMassMin"
              :max-mass="selectedPeptideMassMax"
              :missed-cleavages="selectedMissedCleavages"
              :proteases="selectedProteases"
              @loading-error="handleError"
            />
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'

import TheProteaseMapTable from '../../components/partials/protein/protease-map/TheProteaseMapTable'

import ProtvistaProteomicsdbContainer from '@/components/ProtvistaProteomicsdbContainer'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import LoadingOverlay from '@/components/LoadingOverlay'

export default {
  components: {
    ProtvistaProteomicsdbContainer,
    TheProteaseMapTable,
    DownloadSpeedDial,
    LoadingOverlay
  },
  data () {
    return {
      protvistaLoading: false,
      isError: false
    }
  },
  computed: {
    ...mapGetters({
      data: 'protein/proteaseMap/getData',
      hasData: 'protein/proteaseMap/hasData',
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      configUrl: 'protein/proteaseMap/getConfigUrl',
      tabLoading: 'protein/proteaseMap/isLoading',
      allowedProteases: 'protein/proteaseMap/getAllowedProteases',
      minMissedCleavages: 'protein/proteaseMap/getMinMissedCleavages',
      maxMissedCleavages: 'protein/proteaseMap/getMaxMissedCleavages',
      minPeptideLength: 'protein/proteaseMap/getMinPeptideLength',
      maxPeptideLength: 'protein/proteaseMap/getMaxPeptideLength',
      minPeptideMass: 'protein/proteaseMap/getMinPeptideMass',
      maxPeptideMass: 'protein/proteaseMap/getMaxPeptideMass'
    }),
    selectedProteases: {
      /** @returns {string[]} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedProteases']
      },
      /** @param {string[]} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedProteases', value)
      }
    },
    selectedPeptideLengthMin: {
      /** @returns {number} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedPeptideLengthMin']
      },
      /** @param {number} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedPeptideLengthMin', value)
      }
    },
    selectedPeptideLengthMax: {
      /** @returns {number} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedPeptideLengthMax']
      },
      /** @param {number} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedPeptideLengthMax', value)
      }
    },
    selectedPeptideMassMin: {
      /** @returns {number} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedPeptideMassMin']
      },
      /** @param {number} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedPeptideMassMin', value)
      }
    },
    selectedPeptideMassMax: {
      /** @returns {number} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedPeptideMassMax']
      },
      /** @param {number} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedPeptideMassMax', value)
      }
    },
    selectedMissedCleavages: {
      /** @returns {number} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedMissedCleavages']
      },
      /** @param {number} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedMissedCleavages', value)
      }
    },
    selectedPeptideMassRange: {
      /** @returns {number[]} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedPeptideMassRange']
      },
      /** @param {number[]} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedPeptideMassRange', value)
      }
    },
    selectedPeptideLengthRange: {
      /** @returns {number[]} */
      get () {
        return this.$store.getters['protein/proteaseMap/getSelectedPeptideLengthRange']
      },
      /** @param {number[]} value */
      set (value) {
        this.$store.commit('protein/proteaseMap/setSelectedPeptideLengthRange', value)
      }
    },
    /** @returns {boolean} */
    isConfigUrlSet () {
      return this.configUrl !== ''
    }
  },
  methods: {
    ...mapActions({
      updateConfigUrl: 'protein/proteaseMap/updateConfigUrl'
    }),
    ...mapMutations({
      addNotification: 'notifications/addNotification'
    }),
    load () {
      this.isError = false
      this.protvistaLoading = true
      this.updateConfigUrl()
    },
    getCSV () {
      this.$refs.proteaseMapTable.onExporting()
    },
    handleError (msg) {
      this.isError = true
      this.addNotification({
        color: 'error',
        message: msg
      })
      this.selectedProteases = []
      this.protvistaLoading = false
    },
    handleProtvistaLoaded () {
      this.protvistaLoading = false
    }
  }
}
</script>

<style lang="scss">
.protease-map-number-input {
  width: 70px;

  .v-input__control .v-input__slot input {
    text-align: end;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &[type=number] {
      -moz-appearance: textfield;
    }
  }
}

.protease-map-range-slider {
  .v-input__slot {
    padding-top: 0.5em;
  }
}
</style>

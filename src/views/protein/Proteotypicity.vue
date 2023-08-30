<template>
  <v-row v-if="hasData">
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <download-speed-dial
          :disabled="loading || !currentlyLoadedLabelTypes"
          top
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
          md="3"
        >
          <v-card
            class="mt-2"
            elevation="0"
          >
            <v-card-title>Quantification methods</v-card-title>
            <v-card-text>
              <v-combobox
                v-model="selectedQuantMethods"
                chips
                multiple
                deletable-chips
                outlined
                label="Select methods"
                :items="data"
                item-text="text"
                return-object
                item-value="text"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                :loading="loading"
                @click="calculate"
              >
                Calculate
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="9"
          style="position: relative;"
        >
          <loading-overlay :loading="loading" />
          <the-proteotypicity-table
            ref="proteotypicityTable"
            :protein-id="proteinId"
            :protein-accession="proteinInfo.uniprotId"
            :label-types="selectedLabelTypes"
            @selectedPeptideId="handleSelectedPeptideId"
            @dataLoaded="handleDataLoaded"
          />
        </v-col>

        <router-view />
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import TheProteotypicityTable from '../../components/partials/protein/proteotypicity/TheProteotypicityTable'
import LoadingOverlay from '@/components/LoadingOverlay'

export default {
  components: {
    TheProteotypicityTable,
    DownloadSpeedDial,
    LoadingOverlay
  },
  data: () => ({
    selectedQuantMethods: [],
    selectedLabelTypes: '',
    currentlyLoadedLabelTypes: '',
    loading: false
  }),
  computed: {
    ...mapGetters({
      data: 'protein/proteotypicity/getData',
      hasData: 'protein/proteotypicity/hasData',
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo'
    })
  },
  methods: {
    getCSV () {
      this.$refs.proteotypicityTable.onExporting()
    },
    calculate () {
      const selectedLabelTypes = this.selectedQuantMethods.map((x) => x.text).join(';')

      if (this.currentlyLoadedLabelTypes !== selectedLabelTypes) {
        this.currentlyLoadedLabelTypes = selectedLabelTypes
        this.loading = true
        this.selectedLabelTypes = selectedLabelTypes
      }
    },
    handleDataLoaded () {
      this.loading = false
    },
    handleSelectedPeptideId ({ peptideId }) {
      this.$router.push({
        name: 'proteinProteotypicityPeptidesDetails',
        params: {
          proteinId: this.proteinId,
          peptideId
        }
      })
    }
  }
}
</script>

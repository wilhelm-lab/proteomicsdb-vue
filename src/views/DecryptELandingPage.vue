<template>
  <v-main>
    <v-container fluid>
      <v-row
        justify="center"
        class="ma-2"
      >
        <v-img
          class="mb-xs-0 mb-sm-8 mb-md-8 mb-lg-8 mb-xl-8 mt-2 mx-8"
          :src="decryptelogo"
          max-width="500"
          width="50"
        />
      </v-row>
      <v-row justify="center">
        <v-col
          cols="12"
          xs="12"
          sm="12"
          md="4"
          lg="3"
          xl="3"
        >
          <v-card class="mx-xs-8 mx-sm-8 mx-md-5 mx-lg-5 mx-xl-5 mx-8">
            <v-card-title class="text-h5">
              Search for a Protein
            </v-card-title>
            <v-card-actions>
              <search-bar
                hide-type
                placeholder="Search for a protein"
                class="protein-search-bar"
                type="Protein"
                target-tab="proteinDoseDependentFP"
              />
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          xs="12"
          sm="12"
          md="4"
          lg="3"
          xl="3"
        >
          <v-card class="mx-xs-8 mx-sm-8 mx-md-5 mx-lg-5 mx-xl-5 mx-8">
            <v-card-title class="text-h5">
              Search for a Drug
            </v-card-title>
            <v-card-actions>
              <search-bar
                hide-type
                placeholder="Search for a drug"
                class="drug-search-bar"
                type="Drug"
                :project-id="decryptEProjectID"
              />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-btn
          class="pa-5 ma-2"
          @click="redirectToAllDecryptEDrugs"
        >
          Display all
          <v-img
            :src="decryptelogo"
            max-width="110"
            class="ma-2"
          />
          drugs
        </v-btn>
      </v-row>
      <v-row justify="center">
        <div
          class="mt-2"
          style="font-size: 15pt"
        >
          <b>Also check out our interactive Shiny App: <a
            href="https://decrypte.proteomics.ls.tum.de/"
            target="_blank"
          >https://decrypte.proteomics.ls.tum.de</a></b>
        </div>
      </v-row>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          md="10"
          lg="10"
          xl="10"
        >
          <v-card
            flat
          >
            <v-card-title>
              <h2>Experiments Overview:</h2>
            </v-card-title>
            <v-card-actions
              class="py-xl-8 py-lg-8 py-md-8 py-sm-1 py-xs-1 py-1"
              style="justify-content: center;"
            >
              <TheDecryptEExperimentPlot />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import axios from 'axios'
import SearchBar from '@/components/SearchBar'
import router from '@/router'
import TheDecryptEExperimentPlot from '@/components/partials/decryptm/TheDecryptEExperimentPlot'

export default {
  name: 'DecryptELandingPage',
  components: {
    SearchBar,
    TheDecryptEExperimentPlot
  },
  data: () => ({
    decryptelogo: require('@/assets/home/decrypte_logo.png'),
    statisticsData: {},
    statisticsTable: [],
    cellLineList: {},
    drugList: {},
    decryptEProjectID: 4489

  }),
  created: async function () {
    const statisticsResponse = await axios.get(this.$store.state.host + '/logic/decryptm/getStatistics.xsjs')
    this.statisticsData = statisticsResponse.data
  },
  methods: {
    redirectToAllDecryptEDrugs () {
      // Trigger a drug search without a search string, this yields all ddPTM drugs
      router.push({
        name: 'genericSearch',
        query: {
          q: '',
          type: 'Drug',
          projectId: this.decryptEProjectID
        }
      }
      )
    },
    renamePhosphoColumn: function (dict) {
      // eslint-disable-next-line no-prototype-builtins
      if (dict.hasOwnProperty('Phosphorylation (pSTY)')) {
        dict.Phosphorylation = dict['Phosphorylation (pSTY)']
        delete dict['Phosphorylation (pSTY)']
      }
      return dict
    },
    replaceCommas: function (dict) {
      const keys = Object.keys(dict)
      for (let i = 0; i < keys.length; i++) {
        dict[keys[i]] = dict[keys[i]].replace(/,/g, ',\n')
      }
      return dict
    }
  }
}
</script>

<style scoped>
.content {
  font-size: 16pt;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, 0);
}
.v-card__title {
  word-break: normal;
}

</style>

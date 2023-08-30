<template>
  <v-main>
    <v-container fluid>
      <v-row
        justify="center"
        class="ma-2"
      >
        <v-img
          class="mb-xs-0 mb-sm-8 mb-md-8 mb-lg-8 mb-xl-8 mt-2 mx-8"
          :src="decryptmlogo"
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
                target-tab="proteinDoseDependentPTMs"
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
                :project-id="decryptMProjectID"
              />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-btn
          class="pa-5 ma-2"
          @click="redirectToAllDecryptMDrugs"
        >
          Display all
          <v-img
            :src="decryptmlogoCropped"
            max-width="110"
            class="ma-2"
          />
          drugs
        </v-btn>
      </v-row>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          md="9"
          lg="9"
          xl="9"
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
              <TheDecryptMExperimentMatrix />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row
        justify="center"
        class="mb-16"
      >
        <v-col
          cols="12"
          md="9"
          lg="9"
          xl="9"
        >
          <v-card
            flat
          >
            <v-card-title>
              <h2>decryptM Statistics:</h2>
            </v-card-title>
            <v-card-actions>
              <statstable
                ref="statstable"
                :data-in="statisticsTable"
              />
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
import statstable from '@/components/DecryptMStatTable'
import TheDecryptMExperimentMatrix from '@/components/partials/decryptm/TheDecryptMExperimentMatrix'

export default {
  name: 'DecryptMLandingPage',
  components: {
    SearchBar,
    statstable,
    TheDecryptMExperimentMatrix
  },
  data: () => ({
    decryptmlogo: require('@/assets/home/decryptm_logo.png'),
    decryptmlogoCropped: require('@/assets/home/decryptm_logo.png'),
    statisticsData: {},
    statisticsTable: [],
    cellLineList: {},
    drugList: {},
    decryptMProjectID: 4479
  }),
  created: async function () {
    const statisticsResponse = await axios.get(this.$store.state.host + '/logic/decryptm/getStatistics.xsjs')
    this.statisticsData = statisticsResponse.data
    this.reshapeStatTable()
  },
  methods: {
    redirectToAllDecryptMDrugs () {
      // Trigger a drug search without a search string, this yields all ddPTM drugs
      router.push({
        name: 'genericSearch',
        query: {
          q: '',
          type: 'Drug',
          projectId: this.decryptMProjectID
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
    reshapeStatTable: function () {
      const keys = Object.keys(this.statisticsData)
      let listKeys = []
      listKeys = []
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].includes('COUNT')) {
          const newDict = this.renamePhosphoColumn(this.statisticsData[keys[i]])
          this.statisticsTable.push(newDict)
        } else {
          listKeys.push(keys[i])
        }
      }
      for (let i = 0; i < listKeys.length; i++) {
        let newDict = this.renamePhosphoColumn(this.statisticsData[listKeys[i]])
        newDict = this.replaceCommas(newDict)
        this.statisticsTable.push(newDict)
      }
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

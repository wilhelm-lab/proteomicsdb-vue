<template>
  <v-main class="home__container grey lighten-3">
    <div class="home-hero__container d-flex flex-column align-center">
      <v-container class="home-hero__content py-12">
        <h1 class="text-sm-h3 text-lg-h2  white--text text-left mb-2">
          Welcome to ProteomicsDB
        </h1>
        <p class="home-welcome-text text-subtitle-1 white--text mb-8">
          ProteomicsDB is a multi-omics and multi-organism resource for life science
          research. It covers e.g. proteomics, transcriptomics, and phenomics data for
          e.g. human, mouse, arabidopsis and rice. Different visualization are available
          allowing e.g. a protein- and drug-centric interrogation as well as combined
          analysis via our analytics section.
        </p>

        <search-bar
          ref="searchBar"
          class="home-search-bar elevation-8 mb-2"
        />

        <p
          v-if="randomProtein"
          class="text-body-2 grey--text text--lighten-2"
        >
          or discover a random protein:
          <router-link
            class="white--text font-weight-bold text-body-1"
            :to="{
              name: 'proteinSummary',
              params: {
                proteinId: randomProtein.PROTEIN_ID
              }
            }"
          >
            {{ randomProtein.GENE_NAME }}
          </router-link>
        </p>
      </v-container>
    </div>

    <v-container class="pt-6">
      <v-row class="py-6">
        <v-col
          v-for="(t, index) in tiles"
          :key="index"
          sm="12"
          md="6"
          lg="4"
          xl="3"
        >
          <v-hover v-slot="{ hover }">
            <v-card
              flat
              :class="`elevation-${hover ? 2 : 0}`"
              :disabled="t.disabled"
              :href="t.href"
              :to="t.to"
            >
              <div class="d-flex">
                <v-avatar
                  class="ma-4"
                  size="150"
                  tile
                >
                  <v-img
                    :src="t.icon"
                    contain
                  />
                </v-avatar>
                <div>
                  <v-card-title class="headline">
                    {{ t.title }}
                  </v-card-title>
                  <v-card-subtitle>{{ t.description }}</v-card-subtitle>
                </div>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>

      <v-row class="py-6">
        <v-col cols="12">
          <h2 class="text-h3">
            News
          </h2>
        </v-col>

        <v-col cols="12">
          <the-home-news />
        </v-col>
      </v-row>

      <v-row class="py-6">
        <v-col cols="12">
          <h2 class="text-h3 mb-2">
            Status
          </h2>
          <organism-select />
        </v-col>

        <v-col
          v-for="(s, index) in statusTiles"
          :key="index"
          sm="12"
          md="6"
          xl="3"
        >
          <v-card
            flat
            width="100%"
            height="100%"
          >
            <v-card-title
              tag="h3"
            >
              {{ statusTileTitles[index] }}
            </v-card-title>
            <v-card-text
              class="pt-4"
            >
              <component :is="s.component" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          sm="12"
          md="6"
          xl="3"
        >
          <v-card
            flat
            width="100%"
            height="100%"
          >
            <v-card-title
              tag="h3"
            >
              Repository statistics
            </v-card-title>
            <v-card-text
              class="pt-4"
            >
              <the-home-repository-stats />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

import SearchBar from '@/components/SearchBar'
import OrganismSelect from '@/components/OrganismSelect'
import TheHomeProteomeStats from '@/components/partials/home/TheHomeProteomeStats'
import TheHomeTranscriptomeStats from '@/components/partials/home/TheHomeTranscriptomeStats'
import TheHomeOtherStats from '@/components/partials/home/TheHomeOtherStats'
import TheHomeRepositoryStats from '@/components/partials/home/TheHomeRepositoryStats'
import TheHomeNews from '@/components/partials/home/TheHomeNews'

export default {
  components: {
    SearchBar,
    OrganismSelect,
    TheHomeNews,
    TheHomeRepositoryStats
  },
  data: () => ({
    tiles: [
      {
        title: 'Analytics Toolbox',
        description:
                  'Use our analytics tools to explore co-expression patterns, etc.',
        icon: require('@/assets/home/protein_adopt_small.jpg'),
        to: { name: 'analytics' }
      },
      {
        title: 'Prosit',
        description: 'Predict peptide properties using our online service.',
        icon: require('@/assets/home/prosit.png'),
        href: '/prosit'
      },
      {
        title: 'decryptM',
        description: 'Explore the data from the decryptM manuscript.',
        icon: require('@/assets/home/decryptm_logo.png'),
        to: { name: 'decryptmLanding' }
      },
      {
        title: 'decryptE',
        description: 'Explore the data from the decryptE manuscript.',
        icon: require('@/assets/home/decrypte_logo.png'),
        to: { name: 'decrypteLanding' }
      },
      {
        title: 'Sarcoma',
        description: 'Explore drug effects on sarcoma cell lines.',
        icon: require('@/assets/home/sarcoma.png'),
        to: { name: 'sarcomaLanding' }
      },
      {
        title: 'P-sites Interaction',
        description: 'Explore phosphotyrosine interactome landscape of human receptor tyrosine kinases',
        icon: require('@/assets/home/InteractionsGraph.png'),
        to: { name: 'PYInteractionLanding' }
      },
      {
        title: 'Upload your data',
        description: 'Use our analytics and visualization tools on your data.',
        icon: require('@/assets/home/repository_small.jpg'),
        to: { name: 'analyticsCustomDataUpload' }
      }
    ],
    statusTiles: [
      {
        title: 'Proteome Statistics',
        component: TheHomeProteomeStats
      },
      {
        title: 'Transcriptome Statistics',
        component: TheHomeTranscriptomeStats
      },
      {
        title: 'Other Statistics',
        component: TheHomeOtherStats
      }
    ],
    randomProtein: null
  }),
  computed: {
    ...mapState(['organismTaxcode']),
    /** @returns {{ component: any, title: string }[]} */
    statusTileTitles () {
      const organism = this.$store.state.statistics.statistics[this.organismTaxcode]
      if (!organism || !organism.shortName) {
        return this.statusTiles.map(t => t.title)
      }

      return this.statusTiles.map(
        t => `${organism.shortName}: ${t.title}`
      )
    }
  },
  watch: {
    organismTaxcode () {
      this.randomProtein = null
      this.fetchRandomProtein()
    }
  },
  created () {
    this.fetchRandomProtein()
  },
  mounted () {
    if (this.isLandingPage) {
      this.$refs.searchBar.focus()
    }
  },
  methods: {
    async fetchRandomProtein () {
      const response = await axios.get(
        this.$store.state.host + '/proteomicsdb/logic/getRandomProtein.xsjs',
        {
          params: { taxcode: this.organismTaxcode }
        }
      )

      this.randomProtein = response.data
    }
  }
}
</script>

<style lang="scss">
.home-hero__container {
  min-height: 40vh;
  background: rgb(2,0,36);
  background: linear-gradient(137deg, rgba(2,0,36,1) 0%, rgba(0,27,199,1) 20%, rgba(0,212,255,1) 84%);
}

.home-search-bar,
.home-welcome-text {
  max-width: 960px;
}

.home-hero__content {
  width: 90vw;
  max-width: 960px;
  overflow: hidden;
}
.v-card__title {
  word-break: normal;
}
</style>

<template>
  <v-main>
    <div
      v-if="isDrugHomePage"
      class="drug-landing-page"
    >
      <v-container
        class="py-12"
      >
        <h1 class="text-h2 white--text mb-8">
          Explore drug data
        </h1>

        <search-bar
          ref="searchBar"
          class="drug-search-bar elevation-8"
          hide-type
          outlined
          type="Drug"
        />
        <v-row justify="start">
          <v-col
            xs="12"
            sm="12"
            md="6"
            lg="4"
            xl="3"
            align-self="start"
          >
            <v-btn
              class="mt-8 mb-2 pa-5"
              x-large
              @click="redirectToAllDecryptMDrugs"
            >
              Display all
              <v-img
                :src="decryptmlogoCropped"
                max-width="100"
                class="ma-2"
              />
              drugs
            </v-btn>
          </v-col>
          <v-col
            xs="12"
            sm="12"
            md="6"
            lg="4"
            xl="3"
            align-self="start"
          >
            <v-btn
              class="mt-8 mb-2 pa-5"
              x-large
              @click="redirectToAllDecryptEDrugs"
            >
              Display all
              <v-img
                :src="decryptelogo"
                max-width="100"
                class="ma-2"
              />
              drugs
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <router-view />
  </v-main>
</template>

<script>
import router from '@/router'
import SearchBar from '@/components/SearchBar'

export default {
  name: 'Drug',
  components: {
    SearchBar
  },
  data: () => {
    return {
      decryptmlogoCropped: require('@/assets/home/decryptm_logo.png'),
      decryptelogo: require('@/assets/home/decrypte_logo.png')
    }
  },
  computed: {
    /** @returns {boolean} */
    isDrugHomePage () {
      return this.$route.name === 'drugHome'
    }
  },
  mounted () {
    if (this.$refs.searchBar) this.$refs.searchBar.focus()
  },
  methods: {
    redirectToAllDecryptMDrugs () {
      // Trigger a drug search without a search string, this yields all ddPTM drugs
      router.push({
        name: 'genericSearch',
        query: {
          q: '',
          type: 'Drug',
          projectId: 4479 // DecryptM Project ID
        }
      }
      )
    },

    redirectToAllDecryptEDrugs () {
      // Trigger a drug search without a search string, this yields all ddPTM drugs
      router.push({
        name: 'genericSearch',
        query: {
          q: '',
          type: 'Drug',
          projectId: 4489 // DecryptE Project ID
        }
      }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.drug-landing-page {
    min-height: 40vh;
    background: rgb(2, 0, 36);
    background: linear-gradient(137deg, rgba(2, 0, 36, 1) 0%, rgba(0, 27, 199, 1) 20%, rgba(0, 212, 255, 1) 84%);

    .drug-search-bar {
        max-width: 960px;
    }
}
</style>

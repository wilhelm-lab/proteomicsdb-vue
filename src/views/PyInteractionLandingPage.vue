<template>
  <v-main>
    <v-container fluid>
      <v-row
        justify="center"
        class-name="ma-2"
      >
        <v-img
          class-name="mb-xs-0 mb-sm-8 mb-md-8 mb-lg-8 mb-xl-8 mt-2 mx-8"
          :src="psiteInteractionlogo"
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
          <v-card class-name="mx-xs-8 mx-sm-8 mx-md-5 mx-lg-5 mx-xl-5 mx-8">
            <v-card-title> Protein-protein interaction map</v-card-title>
            <v-card-title class-name="text-h7">
              Search for a Protein name (i.e EGFR)
            </v-card-title>
            <v-card-actions>
              <search-bar
                hide-type
                placeholder="Search for a protein"
                class-name="protein-search-bar"
                type="Protein"
                target-tab="proteinInteractionNetwork"
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
          <v-card class-name="mx-xs-8 mx-sm-8 mx-md-5 mx-lg-5 mx-xl-5 mx-8">
            <v-card
              elevation="0"
              href="https://py-rtks.proteomics.ls.tum.de/main_rtki/"
            >
              <v-card-title>Interactome landscape</v-card-title>
              <v-card-text>
                <div> phosphotyrosine interactome landscape of human receptor tyrosine kinases</div>
              </v-card-text>
              <v-card-actions>
                <v-img
                  :src="elasticLogo"
                  width="100%"
                  max-width="300"
                  max-height="180"
                  class="ma-2"
                />
              </v-card-actions>
            </v-card>
          </v-card>
        </v-col>
      </v-row>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          md="9"
          lg="9"
          xl="9"
        />
      </v-row>
      <v-row
        justify="center"
        class-name="mb-16"
      >
        <v-col
          cols="12"
          md="9"
          lg="9"
          xl="9"
        />
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import SearchBar from '@/components/SearchBar'

export default {
  name: 'PyInteractionLandingPage',
  components: {
    SearchBar
  },
  data: () => ({
    psiteInteractionlogo: require('@/assets/home/InteractionsGraph.png')
  })
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

<template>
  <v-main>
    <v-container>
      <v-row justify="center">
        <v-img
          class="mb-lg-8 mt-lg-2"
          :src="sarcomalogo"
          max-width="300"
        />
      </v-row>
      <v-row justify="center">
        <v-col
          cols="12"
          sm="6"
          lg="5"
          xl="3"
        >
          <v-card
            elevation="0"
            :to="{
              name: 'analyticsCellSensitivity',
              params: { defaultProject: 'Sarcoma2020' }
            }"
          >
            <v-card-title>CELL VIABILITY</v-card-title>
            <v-card-text>
              <div>Explore the dose-dependent responses of 17 sarcoma lines toward 150 drugs</div>
            </v-card-text>
            <v-card-actions>
              <v-img
                :src="cellViabilityLogo"
                width="100%"
                max-width="300"
                max-height="180"
                class="ma-2"
              />
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          sm="6"
          lg="5"
          xl="3"
        >
          <v-card
            elevation="0"
            href="https://www.proteomicsdb.org/sarcoma/"
          >
            <v-card-title>ELASTIC-NET REGRESSION</v-card-title>
            <v-card-text>
              <div>Explore the associations of protein/p-site abundance with 150 drugs across 17 sarcoma lines</div>
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
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
export default {
  data: () => ({
    sarcomalogo: require('@/assets/home/sarcoma.png'),
    elasticLogo: require('@/assets/sarcoma_elasticNet_logo.png'),
    cellViabilityLogo: require('@/assets/sarcoma_cellviability_logo.png')
  })
}
</script>

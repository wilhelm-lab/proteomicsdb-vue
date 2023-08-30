<template>
  <v-main>
    <v-container fluid>
      <v-row>
        <!-- main container -->
        <v-col cols="10">
          <!-- header -->
          <v-row>
            <v-col cols="12">
              <v-card
                flat
                dense
              >
                <v-card-title>Coming Soon</v-card-title>
                <v-card-subtitle style="margin-bottom: -25px">
                  This page does not exist yet.
                </v-card-subtitle>
              </v-card>
            </v-col>
          </v-row>
          <!-- /header -->
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
// import axios from "axios";

export default {
  name: 'ComingSoonVue',
  components: {
  },
  data: () => ({

  }),
  methods: {
  }
}
</script>

<style scoped lang="scss">

</style>

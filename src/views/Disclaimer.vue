<template>
  <v-main>
    <v-container>
      <v-card elevation="0">
        <v-card-title>ProteomicsDB Terms of Use</v-card-title>
        <v-card-text>
          <v-spacer style="height:1cm" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="$sanitizeHtml(disclaimerHtml)" />
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DisclaimerVue',
  components: {},
  data: () => ({
    disclaimerHtml: ''
  }),
  mounted () {
    this.getDisclaimer()
  },
  methods: {
    async getDisclaimer () {
      const response = await axios.get(
        this.$store.state.host + '/proteomicsdb/js/tumDisclaimer.fragment.xml'
      )

      // response is SAP specific XML and html needs to be extracted
      this.disclaimerHtml = response.data
        .match(/<cl:VerticalLayout[\n\r\s]+id="disclaimerOverlayLayout">(.*)<\/cl:VerticalLayout>/s)[1]
        .replaceAll('html:', '')
    }
  }
}
</script>

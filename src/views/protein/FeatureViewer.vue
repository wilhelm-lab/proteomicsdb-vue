<template>
  <v-row>
    <v-col cols="12">
      <v-card
        class="mb-10"
        elevation="0"
      >
        <ProtvistaProteomicsdbContainer
          v-if="loaded"
          :accession="proteinInfo.uniprotId"
          :config-url="configUrl"
        />
        <v-card-text class="text-right">
          <span style="vertical-align: 50%">Powered by </span>
          <a
            href="https://github.com/ebi-webcomponents/protvista-uniprot"
            target="_blank"
          >
            <v-img
              :src="require('@/assets/commons/uniprot.svg')"
              width="75px"
              style="display: inline-block"
            />
          </a>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
import ProtvistaProteomicsdbContainer from '@/components/ProtvistaProteomicsdbContainer.vue'

export default {
  components: {
    ProtvistaProteomicsdbContainer
  },
  computed: {
    ...mapGetters({
      proteinInfo: 'protein/getProteinInfo',
      proteinId: 'protein/getProteinId'
    }),
    /** @returns {boolean} */
    loaded () {
      return this.proteinInfo.uniprotId !== ''
    },
    /** @returns {string} */
    configUrl () {
      return `${this.$store.state.host}/proteomicsdb/` +
          `logic/featureViewer/getConfig.xsjs?accession=${this.proteinInfo.uniprotId}&protein_id=${this.proteinId}`
    }
  }
}
</script>

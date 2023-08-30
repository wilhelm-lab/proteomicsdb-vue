<template>
  <v-main>
    <v-container>
      <v-row
        justify="space-around"
        align="center"
      >
        <v-col cols="12">
          <the-protein-search-table
            v-if="searchType === 'Protein'"
            :search-string="searchQuery"
            :taxcode="searchTaxcode"
            :target-tab="targetTab"
          />
          <the-drug-search-table
            v-else-if="searchType === 'Drug'"
            :search-string="searchQuery"
            :taxcode="searchTaxcode"
            :project-id="searchProjectId"
            :target-tab="targetTab"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import TheProteinSearchTable from '../../components/partials/search/TheProteinSearchTable'
import TheDrugSearchTable from '../../components/partials/search/TheDrugSearchTable'

export default {
  components: {
    TheProteinSearchTable,
    TheDrugSearchTable
  },
  props: {
    query: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    taxcode: {
      type: Number,
      default: 0
    }
  },
  computed: {
    /** @returns {number} */
    searchTaxcode () {
      return this.taxcode || this.$store.state.organismTaxcode
    },
    /** @returns {string} */
    searchType () {
      return this.type || this.$route.query.type
    },
    /** @returns {string} */
    searchQuery () {
      return this.query || this.$route.query.q
    },
    /** @returns {number} */
    searchProjectId () {
      return this.$route.query.projectId || -1
    },
    // TODO: seems broken
    /** @returns {string} */
    targetTab () {
      return this.query || this.$route.query.targetTab
    }
  }
}
</script>

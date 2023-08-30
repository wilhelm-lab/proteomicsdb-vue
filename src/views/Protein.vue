<template>
  <v-main>
    <div
      v-if="isLandingPage"
      class="protein-landing-page"
    >
      <v-container
        class="py-12"
      >
        <h1 class="text-h2 white--text mb-8">
          Explore proteome
        </h1>

        <search-bar
          ref="searchBar"
          class="protein-search-bar elevation-8"
          hide-type
          outlined
          type="Protein"
        />
      </v-container>
    </div>
    <router-view />
  </v-main>
</template>

<script>
import SearchBar from '@/components/SearchBar'

export default {
  name: 'Protein',
  components: {
    SearchBar
  },
  computed: {
    /** @returns {boolean} */
    isLandingPage () {
      return this.$route.name === 'proteinHome'
    }
  },
  mounted () {
    if (this.isLandingPage) {
      this.$refs.searchBar.focus()
    }
  }
}
</script>

<style scoped lang="scss">
.protein-landing-page {
  min-height: 40vh;
  background: rgb(2,0,36);
  background: linear-gradient(137deg, rgba(2,0,36,1) 0%, rgba(0,27,199,1) 20%, rgba(0,212,255,1) 84%);

  .protein-search-bar {
    max-width: 960px;
  }
}
</style>

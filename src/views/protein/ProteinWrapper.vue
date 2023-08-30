<template>
  <div class="fill-height">
    <wrapper-left-navigation
      :items="menuItems"
    >
      <template slot="header">
        <h1 class="text-h5">
          {{ proteinInfo.title }}
        </h1>
        <div v-if="proteinInfo.uniprotId">
          <span class="uniprot-url-label">
            UniProt:
          </span>
          <a
            class="uniprot-url"
            :href="uniprotUrl"
            target="_blank"
          >
            {{ proteinInfo.uniprotId }}
            <v-icon
              small
              color="primary"
              class="d-inline"
            >mdi mdi-open-in-new</v-icon>
          </a>
        </div>
      </template>
    </wrapper-left-navigation>
    <v-container
      fluid
      class="protein-wrapper-container pl-md-6 py-6 grey lighten-3 fill-height"
    >
      <router-view />
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WrapperLeftNavigation from '@/components/WrapperLeftNavigation'

export default {
  components: {
    WrapperLeftNavigation
  },
  data: () => ({
    uniprotBaseUrl: 'https://www.uniprot.org/uniprot/'
  }),
  computed: {
    ...mapGetters({
      menuItems: 'protein/getMenuItems',
      getModuleKeyByRouteMatched: 'protein/getModuleKeyByRouteMatched',
      proteinInfo: 'protein/getProteinInfo',
      proteinId: 'protein/getProteinId'
    }),
    /** @returns {string} */
    uniprotUrl () {
      return new URL(this.proteinInfo.uniprotId, this.uniprotBaseUrl).href
    }
  },
  watch: {
    $route: {
      async handler () {
        if (this.$route.params.proteinId !== this.proteinId) {
          await this.setStoreProtein()
        }
      },
      immediate: true,
      deep: true
    }
  },
  async created () {
    await this.setStoreProtein()
  },
  methods: {
    async setStoreProtein () {
      const proteinId = this.$route.params.proteinId.toString()
      await this.$store.dispatch('protein/switchProtein', proteinId)
      await this.$store.dispatch(
        'protein/fetchAllWithPriority',
        this.getModuleKeyByRouteMatched(this.$route.matched)
      )
    }
  }
}
</script>

<style scoped>
.container.protein-wrapper-container {
  align-items: flex-start;
}

.uniprot-url {
  display: inline-flex;
  align-items: center;

}

.uniprot-url .v-icon {
  vertical-align: middle;
}
</style>

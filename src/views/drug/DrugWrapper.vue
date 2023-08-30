<template>
  <div class="fill-height">
    <wrapper-left-navigation
      :items="menuItems"
    >
      <template slot="header">
        <h1 v-if="drugName">
          {{ drugName }}
        </h1>
        <div v-if="chemblId">
          ChEMBL:
          <a
            class="chembl-url"
            :href="chemblUrl"
            target="_blank"
          >
            {{ chemblId }}
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
      class="drug-wrapper-container pl-md-6 py-6 grey lighten-3 fill-height"
    >
      <router-view v-if="hasDrugInfo" />
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WrapperLeftNavigation from '@/components/WrapperLeftNavigation'

export default {
  name: 'DrugWrapper',
  components: {
    WrapperLeftNavigation
  },
  data: () => ({
    chemblBaseUrl: 'https://www.ebi.ac.uk/chembl/compound_report_card/'
  }),
  computed: {
    ...mapGetters({
      menuItems: 'drug/getMenuItems',
      getModuleKeyByRouteMatched: 'drug/getModuleKeyByRouteMatched',
      drugName: 'drug/getDrugName',
      chemblId: 'drug/getChemblId',
      hasDrugInfo: 'drug/hasDrugInfo',
      drugId: 'drug/getDrugId'
    }),

    /** @returns {string} */
    chemblUrl () {
      return new URL(this.chemblId, this.chemblBaseUrl).href
    }
  },
  watch: {
    $route: {
      async handler () {
        if (this.$route.params.drugId !== this.drugId) {
          await this.setStoreDrug()
        }
      },
      immediate: true,
      deep: true
    }
  },
  async created () {
    await this.setStoreDrug()
  },
  methods: {
    async setStoreDrug () {
      await this.$store.dispatch('drug/switchDrug', this.$route.params)
      await this.$store.dispatch('drug/fetchDrugInfo')
      await this.$store.dispatch(
        'drug/fetchAllWithPriority',
        this.getModuleKeyByRouteMatched(this.$route.matched)
      )
    }
  }
}
</script>

<style scoped>
.container.drug-wrapper-container {
  align-items: flex-start;
}

.chembl-url {
  display: inline-flex;
  align-items: center;
}

.chembl-url .v-icon {
  vertical-align: middle;
}
</style>

<template>
  <div class="pa-4 fill-height align-baseline grey lighten-3">
    <v-container>
      <h1 class="text-h4 mb-4">
        ProteomicsDB Analytics Toolbox
      </h1>

      <v-card
        width="100%"
        class="mb-4 pa-4"
        flat
      >
        <h2 class="text-h5 mb-2">
          Filter by tag
        </h2>
        <p class="text-body-2">
          Select one of the terms below to filter the available tools by wether they are applicable on the corresponding types of data.
        </p>
        <v-chip
          v-for="tag in allTags"
          :key="tag"
          class="mr-2"
          :color="filterTagActive(tag) ? 'primary' : ''"
          :dark="filterTagActive(tag)"
          :close="filterTagActive(tag)"
          @click="toggleFilterTag(tag)"
          @click:close="toggleFilterTag(tag)"
        >
          {{ tag }}
        </v-chip>
      </v-card>

      <v-row>
        <v-col
          v-for="tool of filteredTools"
          :key="tool.target"
          sm="12"
          md="6"
          lg="4"
          class="analytics-tool-col"
        >
          <v-hover>
            <v-card
              slot-scope="{ hover }"
              :class="`elevation-${hover ? 2 : 0}`"
              width="100%"
              height="100%"
              flat
              :to="tool.to"
              :disabled="tool.disabled"
            >
              <div class="d-flex flex-column fill-height">
                <div class="d-flex flex-wrap justify-space-between">
                  <div>
                    <v-card-title
                      tag="h2"
                      class="text-h5"
                    >
                      <div
                        v-if="tool.disabled && tool.disabledReason"
                        class="analytics-tool-disabled-reason text-h6 secondary--text text--darken-2 text--bold"
                      >
                        {{ tool.disabledReason }}
                      </div>
                      {{ tool.title }}
                    </v-card-title>

                    <v-card-subtitle>
                      {{ tool.description }}
                    </v-card-subtitle>
                  </div>

                  <v-img
                    contain
                    class="analytics-tool-icon ma-4"
                    :src="tool.icon"
                  />
                </div>
                <v-spacer />
                <v-card-actions>
                  <v-btn
                    v-if="tool.disabled"
                    class="ml-2 mt-5 mb-2"
                    outlined
                    disabled
                  >
                    Under Construction
                  </v-btn>
                  <v-btn
                    v-else
                    class="ml-2 mt-5 mb-2"
                    outlined
                  >
                    Open
                  </v-btn>
                </v-card-actions>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsHome',
  props: {},
  data: () => ({
    toolDefinitions: [
      {
        title: 'Expression Heatmap',
        to: { name: 'analyticsExpressionHeatmap' },
        description: 'Analysis of protein sets. Compare the expression of your short-list of proteins over multiple tissues, fluids and cell lines.',
        icon: require('@/assets/heatmap.png'),
        tags: ['Protein', 'Cell line']
      },
      {
        title: 'Inhibitor potency / selectivity analysis',
        to: { name: 'analyticsSelectivity' },
        description: 'Compare the potency and selectivity of multiple inhibitors over your protein of interest',
        icon: require('@/assets/selectivity.png'),
        tags: ['Drug', 'Protein']
      },
      {
        title: 'Cell potency / sensitivity analysis',
        to: { name: 'analyticsCellSensitivity' },
        description: 'Compare the potency and sensitivity of inhibitors over your cell line of interest',
        icon: require('@/assets/sensitivity.png'),
        tags: ['Cell line', 'Drug']
      },
      {
        title: 'Dose Dependent Protein-Drug Interaction Analysis',
        to: { name: 'analyticsProteinDrugInteraction' },
        description: 'Show the interaction of multiple drugs on target proteins.',
        icon: require('@/assets/combination.png'),
        tags: ['Drug', 'Protein']
      },
      {
        title: 'PTMNavigator',
        to: { name: 'analyticsPTMNavigator' },
        description: 'Discover how PTMs are regulated across biochemical pathways.',
        icon: require('@/assets/ptmnavigatortile.png'),
        tags: ['Drug', 'Protein', 'Cell line']
      },
      // {
      //   title: 'decryptM Dashboard',
      //   to: { name: 'analyticsDecryptMDashboard' },
      //   description: 'Explore your own decryptM data and behold your most beautiful curves! ',
      //   icon: require('@/assets/home/decryptm_logo.png'),
      //   tags: ['Drug', 'Protein', 'Cell line']
      // },
      {
        title: 'Custom Data Upload',
        to: { name: 'analyticsCustomDataUpload' },
        description: 'Upload your own datasets to analyze them online or compare them with the data from ProteomicsDB',
        icon: require('@/assets/home/upload.png'),
        tags: []
      }
      // {
      //   title: 'Data Explorer',
      //   to: { name: 'dataExplorer' },
      //   icon: require('@/assets/general_analytics.png')
      // }
    ],
    filterTags: []
  }),
  computed: {
    /** @typedef {{
        title: string,
        to?: { name: string },
        target?: string,
        disabled?: boolean,
        disabledReason?: string,
        description: string,
        icon: string,
        tags: string[],
      }} Tool
      * @returns {Tool[]}
      */
    tools () {
      return this.toolDefinitions.map(tool => {
        if (!this.isAvailableForCurrentOrganism(tool)) {
          const toolRoute = this.$router.getRoutes().find(r => r.name === tool.to.name)

          if (!toolRoute || !toolRoute.meta || !toolRoute.meta.availableOrganisms) {
            return tool
          }

          const disabled = !toolRoute.meta.availableOrganisms.includes(this.$store.state.organismTaxcode)

          const availableOrganismNames = toolRoute.meta.availableOrganisms
            .map(taxcode =>
              this.$store.state.organisms.find(
                o => o.taxcode === taxcode
              ).text
            )

          return {
            ...tool,
            disabled,
            disabledReason: 'This tool is only available for: ' + availableOrganismNames
          }
        }

        return tool
      })
    },
    /** @returns {string[]} */
    allTags () {
      const tags = this.tools.map(
        tool => tool.tags
      )
        .reduce(
          (allTags, tags) => allTags.concat(tags), []
        )

      const uniqueTags = [...new Set(tags)]

      return uniqueTags
    },
    /** @returns {boolean} */
    filterActive () {
      return this.filterTags.length > 0
    },
    /** @returns {Tool[]} */
    filteredTools () {
      return this.tools.filter(tool => !this.filterActive || this.isFilteredByTags(tool.tags))
    }
  },
  methods: {
    toggleFilterTag (tag) {
      if (this.filterTagActive(tag)) {
        this.filterTags = this.filterTags.filter(t => t !== tag)
      } else {
        this.filterTags.push(tag)
      }
    },
    filterTagActive (tag) {
      return this.filterTags.includes(tag)
    },
    isFilteredByTags (tags) {
      const tagsSet = new Set(tags)
      const intersection = this.filterTags.filter(t => tagsSet.has(t))
      return intersection.length > 0
    },
    isAvailableForCurrentOrganism (tool) {
    }
  }
}
</script>

<style scoped>
.analytics-tool-icon {
  max-height: 150px;
  max-width: 150px;
}

.v-card__title {
  word-break: normal;
}

.analytics-tool-disabled-reason {
  opacity: 1;
}
</style>

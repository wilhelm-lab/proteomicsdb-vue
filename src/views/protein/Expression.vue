<template>
  <v-row v-if="hasData">
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <download-speed-dial
          top
          right
          direction="left"
          csv
          svg
          png
          :loading="loading"
          @csv="getCSV"
          @svg="getSVG"
          @png="getPNG"
        />
      </v-row>
    </v-col>

    <v-col
      cols="12"
      md="6"
      lg="4"
      xl="3"
    >
      <v-card
        elevation="0"
      >
        <v-card-title>
          Data Selection
        </v-card-title>
        <v-card-text>
          <v-radio-group
            v-model="omicsTypeSelected"
            label="Omics type"
          >
            <v-radio
              v-for="omicsType of omicsTypes"
              :key="omicsType"
              :label="omicsType"
              :value="omicsType"
            />
          </v-radio-group>

          <legend class="v-label text-body-2">
            Biological source
          </legend>
          <div v-if="bioSources.length > 0">
            <v-checkbox
              v-for="bioSource of bioSources"
              :key="bioSource"
              v-model="bioSourcesSelected"
              multiple
              :label="bioSource"
              :value="bioSource"
              hide-details
              class="mt-1 biological-source-checkbox"
            />
          </div>

          <v-radio-group
            v-model="quantificationSelected"
            label="Quantification / calculation method"
            class="mt-3"
          >
            <v-radio
              v-for="quantification of quantifications"
              :key="quantification.id"
              :label="quantificationTextFormat(quantification)"
              :value="quantification"
            />
          </v-radio-group>
        </v-card-text>
        <div class="d-flex flex-wrap px-4 pb-2">
          <v-btn
            color="primary"
            block
            :loading="loading"
            :disabled="isCurrentSelectionLoaded"
            @click="loadSelection"
          >
            Load Selection
          </v-btn>
          <div
            v-if="isCurrentSelectionLoaded"
            class="text-caption"
          >
            Current selection already loaded
          </div>
        </div>
      </v-card>
    </v-col>

    <v-col
      v-if="hasLoadeSelection"
      cols="12"
      md="6"
      lg="8"
      xl="9"
      class="pt-6"
    >
      <ProteinExpressionBodymapWrapper
        ref="bodymap"
        :protein-id="proteinId"
        :protein-accession="proteinInfo.uniprotId"
        :omics-type="loadedSelection.omicsType"
        :tissue_category="loadedSelection.tissueCategoryString"
        :quantification="loadedSelection.quantification.method"
        :calculation="loadedSelection.quantification.unit"
        :selected-organism="organism"
        scope="1"
        group_by_tissue="1"
        class="protein-expression-bodymap"
        @dataLoaded="handleDataLoaded"
        @organSelected="onOrganSelect"
      />
    </v-col>

    <v-col
      v-if="hasLoadeSelection"
      cols="12"
      lg="6"
    >
      <TissueExpressionBars
        ref="tissueBars"
        :data="expressionData"
        @barSelected="onTissueBarSelect"
      />
    </v-col>

    <v-col
      v-if="hasLoadeSelection"
      cols="12"
      lg="6"
    >
      <SampleExpressionBars
        v-if="tissuesSelectedString !== ''"
        ref="sampleBars"
        :protein-id="proteinId"
        :quantification="loadedSelection.quantification.method"
        :tissue_category="loadedSelection.tissueCategoryString"
        :tissues_selected="tissueIdsSelectedString"
        :calculation="loadedSelection.quantification.unit"
        :omics-type="loadedSelection.omicsType"
        scope="1"
        group_by_tissue="0"
      />
      <v-alert
        v-else
        color="blue-grey"
        text
      >
        Select expression bar to show sample specific expression here.
      </v-alert>
    </v-col>

    <canvas
      id="canvasId"
      style="display:none"
    />
  </v-row>
</template>

<script>
import _ from 'lodash'

import utils from '../../utils/downloadUtils'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ProteinExpressionBodymapWrapper from '@/vue-d3-component-wrappers/ProteinExpressionBodymapWrapper'
import TissueExpressionBars from '@/vue-d3-component-wrappers/TissueExpressionBars'
import SampleExpressionBars from '@/vue-d3-component-wrappers/SampleExpressionBars'

import { mapGetters } from 'vuex'

export default {
  components: {
    DownloadSpeedDial,
    ProteinExpressionBodymapWrapper,
    TissueExpressionBars,
    SampleExpressionBars
  },
  data: () => ({
    loading: false,
    dataLoaded: false,
    expressionData: [],
    tissueIdsSelected: [],
    svgCss: [require('@/vue-d3-components/Bodymap.css.prdb'), require('@/vue-d3-components/ExpressionBars.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      omicsTypes: 'protein/expression/getOmicsTypes',
      getQuantifications: 'protein/expression/getQuantifications',
      getBioSources: 'protein/expression/getBioSources',
      selection: 'protein/expression/getSelection',
      loadedSelection: 'protein/expression/getLoadedSelection',
      hasLoadeSelection: 'protein/expression/hasLoadedSelection',
      isCurrentSelectionLoaded: 'protein/expression/isCurrentSelectionLoaded',
      hasData: 'protein/expression/hasData',
      organism: 'getOrganism'
    }),
    /** @returns {string} */
    tissuesSelectedString () {
      return this.tissueIdsSelected
        .map(id => this.tissueIdToSapSynonymMap[id])
        .join(';')
    },
    /** @returns {string} */
    tissueIdsSelectedString () {
      return this.tissueIdsSelected.join(';')
    },
    omicsTypeSelected: {
      /** @return {string} */
      get () {
        return this.selection.omicsType
      },
      /** @param {string} omicsType */
      set (omicsType) {
        this.$store.dispatch('protein/expression/updateSelection', { omicsType })
      }
    },
    /**
      * @typedef {{ id: number, method: string, unit: string }} Quantification
      * @returns {Quantification[]}
      */
    quantifications () {
      return this.getQuantifications(this.omicsTypeSelected)
    },
    quantificationSelected: {
      /** @returns {Quantification} */
      get () {
        return this.selection.quantification
      },
      /** @param {Quantification} quantification */
      set (quantification) {
        this.$store.dispatch('protein/expression/updateSelection', { quantification })
      }
    },
    /** @returns {string[]} */
    bioSources () {
      return this.getBioSources(this.omicsTypeSelected, this.quantificationSelected)
    },
    bioSourcesSelected: {
      /** @returns {string[]} */
      get () { return this.selection.bioSources },
      /** @param {string[]} bioSources */
      set (bioSources) {
        this.$store.dispatch('protein/expression/updateSelection', { bioSources })
      }
    },
    /** @returns {Object.<string, string>} */
    tissueIdToSapSynonymMap () {
      return Object.fromEntries(this.expressionData.map(x => [x.TISSUE_ID, x.SAP_SYNONYM]))
    }
  },
  watch: {
    selection () {
      this.tissueIdsSelected = []
    }
  },
  mounted () {
    this.$store.commit('protein/expression/setLoadedSelection', this.selection)
  },
  methods: {
    loadSelection () {
      this.loading = true
      this.$store.commit('protein/expression/setLoadedSelection', this.selection)
    },
    getCSV () {
      this.loading = true
      this.$refs.bodymap.getCSV()

      this.loading = false
    },
    getSVG () {
      this.downloadPlots('svg')
    },
    getPNG () {
      this.downloadPlots('png')
    },
    downloadPlots (type) {
      this.loading = true
      let plots = []
      plots.push(this.$refs.bodymap.getSVG())
      plots = plots.concat(this.$refs.tissueBars.getSVG())

      // is sample bar is visible --> tissue bars selected
      if (this.tissueIdsSelected.length > 0) {
        plots = plots.concat(this.$refs.sampleBars.getSVG())
      }
      if (plots) {
        utils.downloadSVGs(plots, 'Expression ' + this.proteinInfo.uniprotId, type === 'svg', 'canvasId', this.svgCss)
      }
      this.loading = false
    },
    onOrganSelect (sapSynonym) {
      const tissueIds = this.sapSynonymToTissueIds(sapSynonym)
      const correspondingTissueIdsSelected = _.intersection(tissueIds, this.tissueIdsSelected)

      // if organ is selected (i.e. some tissue bars corresponding to organ are selected)
      if (correspondingTissueIdsSelected.length > 0) {
        // deselect all corresponding selected tissue bars
        correspondingTissueIdsSelected.forEach((id) => {
          this.$delete(this.tissueIdsSelected, this.tissueIdsSelected.indexOf(id))
          this.$refs.tissueBars.toggleBarTissueId({ TISSUE_ID: id })
        })
      } else {
        this.tissueIdsSelected = _.union(this.tissueIdsSelected, tissueIds)

        // select all tissue bars corresponding to organ
        tissueIds.forEach((id) => {
          this.$refs.tissueBars.toggleBarTissueId({ TISSUE_ID: id })
        })
      }
    },
    onTissueBarSelect ({ TISSUE_ID }) {
      const correspondingOrgan = this.tissueIdToSapSynonymMap[TISSUE_ID]
      const correspondingOrganTissueIds = this.sapSynonymToTissueIds(correspondingOrgan)

      if (this.tissueIdsSelected.includes(TISSUE_ID)) {
        this.$delete(this.tissueIdsSelected, this.tissueIdsSelected.indexOf(TISSUE_ID))

        // if last tissue bar corresponding to organ was deselected also deselect organ
        const correspondingOrganTissueIdsSelected = _.intersection(correspondingOrganTissueIds, this.tissueIdsSelected)
        if (correspondingOrganTissueIdsSelected.length === 0) {
          this.$refs.bodymap.toggleOrgan(correspondingOrgan)
        }
      } else {
        // if organ is not already selected, select it
        const correspondingOrganTissueIdsSelected = _.intersection(correspondingOrganTissueIds, this.tissueIdsSelected)
        if (correspondingOrganTissueIdsSelected.length === 0) {
          this.$refs.bodymap.toggleOrgan(correspondingOrgan)
        }

        this.tissueIdsSelected = _.union(this.tissueIdsSelected, [TISSUE_ID])
      }
    },
    handleDataLoaded (data) {
      if (data) {
        this.expressionData = data
        this.dataLoaded = true
      }

      this.loading = false
    },
    quantificationTextFormat (quantification) {
      return `${quantification.method} - ${quantification.unit}`
    },
    sapSynonymToTissueIds (sapSynonym) {
      return _.entries(this.tissueIdToSapSynonymMap)
        .filter(([id, sap]) => sap === sapSynonym)
        .map(([id, sap]) => id)
    }
  }
}
</script>

<style lang="scss">
// TODO: this is a dirty fix - Bodymap should be refactored
.protein-expression-bodymap {
  .row {
    flex-wrap: nowrap;
  }
}
</style>

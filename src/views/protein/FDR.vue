<template>
  <v-row v-if="hasData">
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <downloader
          top
          right
          direction="bottom"
          svg
          png
          @svg="getSVG"
          @png="getPNG"
        />
      </v-row>
    </v-col>

    <v-col cols="12">
      <v-row>
        <v-col
          cols="12"
          lg="6"
        >
          <v-card
            elevation="0"
            class="overflow-y-auto"
          >
            <v-card-title>
              <h2 class="text-h5">
                Gene FDR Estimate
              </h2>
            </v-card-title>
            <v-card-text>
              <gene-fdr-graph
                ref="geneFdr"
                :protein-id="proteinId"
                :target-name="proteinInfo.name"
              />
              <v-divider />
              <specific-gene-fdr-graph
                ref="geneSpecFdr"
                :protein-id="proteinId"
                :target-name="proteinInfo.name"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          lg="6"
        >
          <v-card
            elevation="0"
            class="overflow-y-auto"
          >
            <v-card-title>
              <h2 class="text-h5">
                Protein FDR Estimate
              </h2>
            </v-card-title>
            <v-card-text>
              <protein-fdr-graph
                ref="proteinFdr"
                :protein-id="proteinId"
                :target-name="proteinInfo.uniprotId"
              />
              <v-divider />
              <specific-protein-fdr-graph
                ref="proteinSpecFdr"
                :protein-id="proteinId"
                :target-name="proteinInfo.uniprotId"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <canvas
      id="download-util-canvas"
      style="display:none"
    />
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

import utils from '../../utils/downloadUtils'
import downloader from '@/components/DownloadSpeedDial'
import GeneFdrGraph from '@/vue-d3-component-wrappers/GeneFDRGraph'
import SpecificGeneFdrGraph from '@/vue-d3-component-wrappers/SpecificGeneFDRGraph'
import ProteinFdrGraph from '@/vue-d3-component-wrappers/ProteinFDRGraph'
import SpecificProteinFdrGraph from '@/vue-d3-component-wrappers/SpecificProteinFDRGraph'

export default {
  components: {
    downloader,
    GeneFdrGraph,
    SpecificGeneFdrGraph,
    ProteinFdrGraph,
    SpecificProteinFdrGraph
  },
  data: () => ({
    svgCss: [require('@/vue-d3-components/FDRGraph.css.prdb')]
  }),
  computed: {
    ...mapGetters({
      hasData: 'protein/fdr/hasData',
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo'
    })
  },
  methods: {
    downloadPlots (type) {
      const plots = []
      plots.push(this.$refs.geneFdr.getSVG())
      plots.push(this.$refs.geneSpecFdr.getSVG())
      plots.push(this.$refs.proteinFdr.getSVG())
      plots.push(this.$refs.proteinSpecFdr.getSVG())

      if (plots) {
        utils.downloadSVGs(plots, 'FDR Distributions: ', type === 'svg', 'download-util-canvas', this.svgCss)
      }
    },
    getSVG () {
      this.downloadPlots('svg')
    },
    getPNG () {
      this.downloadPlots('png')
    }
  }
}
</script>

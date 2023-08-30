<template>
  <v-row>
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <download-speed-dial
          top
          :disabled="disabled"
          right
          direction="left"
          svg
          png
          sif
          @svg="getSVG"
          @png="getPNG"
          @sif="getSIF"
        />
      </v-row>
    </v-col>

    <v-col cols="12">
      <interaction-wrapper
        ref="interactionnetwork"
        :protein-id="proteinId"
        :protein-accession="proteinInfo.uniprotId"
        @dataLoaded="disabled=false"
      />
    </v-col>

    <canvas
      id="downloadTempCanvas"
      style="display:none"
    />
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import InteractionWrapper from '@/vue-d3-component-wrappers/InteractionWrapper'
import utils from '../../utils/downloadUtils'

export default {
  components: {
    InteractionWrapper,
    DownloadSpeedDial
  },
  data: () => ({
    disabled: true
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo'
    })
  },
  methods: {
    getSIF () {
      const csvRows = this.$refs.interactionnetwork.$refs.interactionsgraph.getSif()
      const fileName = this.proteinAccession
      utils.downloadFile(csvRows, fileName, 'sif')
    },
    getPNG () {
      const plots = []
      plots.push(this.$refs.interactionnetwork.$refs.interactionsgraph.getSVG())
      utils.downloadSVGs(
        plots,
        'InteractionsGraph: ',
        false,
        'downloadTempCanvas',
        this.$refs.interactionnetwork.getSvgCss()
      )
    },
    getSVG () {
      const plots = []
      plots.push(this.$refs.interactionnetwork.$refs.interactionsgraph.getSVG())
      utils.downloadSVGs(
        plots,
        'InteractionsGraph: ',
        true,
        'downloadTempCanvas',
        this.$refs.interactionnetwork.getSvgCss()
      )
    }
  }
}
</script>

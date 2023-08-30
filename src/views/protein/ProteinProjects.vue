<template>
  <v-row>
    <v-col cols="12">
      <v-row>
        <v-spacer />
        <download-speed-dial
          top
          right
          direction="left"
          csv
          @csv="getCSV"
        />
      </v-row>
    </v-col>

    <v-col cols="12">
      <TheProteinProjectTable
        ref="searchTable"
        :data-source="dataIn"
        :protein-id="proteinId"
        :protein-accession="proteinInfo.uniprotId"
      />
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

import DownloadSpeedDial from '@/components/DownloadSpeedDial'

import TheProteinProjectTable from '../../components/partials/protein/projects/TheProteinProjectTable'

export default {
  components: {
    TheProteinProjectTable,
    DownloadSpeedDial
  },
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      dataIn: 'protein/projects/getData'
    })
  },
  methods: {
    getCSV: function () {
      this.$refs.searchTable.onExporting()
    }
  }
}
</script>

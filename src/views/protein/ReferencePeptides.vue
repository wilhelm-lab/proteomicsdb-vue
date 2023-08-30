<template>
  <v-row
    v-if="hasData"
  >
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
      <TheReferencePeptideTable
        ref="searchTable"
        :protein-id="proteinId"
        :data-source="data.PEPTIDES"
        :protein-accession="proteinInfo.uniprotId"
      />
      <router-view />
    </v-col>
    <v-row />
  </v-row>
</template>

<script>
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import TheReferencePeptideTable from '../../components/partials/protein/referencePeptides/TheReferencePeptideTable'
import { mapGetters } from 'vuex'

export default {
  components: {
    TheReferencePeptideTable,
    DownloadSpeedDial
  },
  computed: {
    ...mapGetters({
      data: 'protein/referencePeptides/getData',
      hasData: 'protein/referencePeptides/hasData',
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo'
    })
  },
  methods: {
    openPeptideDetails ({ peptideId }) {
      this.$router.push({
        name: 'proteinReferencePeptidesDetails',
        params: {
          proteinId: this.proteinId,
          peptideId
        }
      })
    },
    getCSV () {
      this.$refs.searchTable.onExporting()
    }
  }
}
</script>

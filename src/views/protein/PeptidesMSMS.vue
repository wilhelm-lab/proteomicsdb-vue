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
      <ThePeptideMsmsTable
        ref="searchTable"
        :data-source="data.PEPTIDES"
        :protein-id="proteinId"
        :protein-accession="proteinInfo.uniprotId"
      />
      <router-view />
    </v-col>
  </v-row>
</template>

<script>
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import ThePeptideMsmsTable from '../../components/partials/protein/peptides/ThePeptideMsmsTable'
import { mapGetters } from 'vuex'

export default {
  components: {
    ThePeptideMsmsTable,
    DownloadSpeedDial
  },
  computed: {
    ...mapGetters({
      data: 'protein/peptidesMSMS/getData',
      hasData: 'protein/peptidesMSMS/hasData',
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo'
    })
  },
  methods: {
    getCSV () {
      this.$refs.searchTable.onExporting()
    }
  }
}
</script>

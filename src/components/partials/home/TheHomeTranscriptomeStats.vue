<template>
  <v-simple-table dense>
    <tbody v-if="hasData">
      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .TISSUE_COUNT_TRANSCRIPTS.DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .TISSUE_COUNT_TRANSCRIPTS.VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .QUANTITATIVE_TRANSCRIPTOMICS_DATA_POINTS
              .DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .QUANTITATIVE_TRANSCRIPTOMICS_DATA_POINTS.VALUE
          }}
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      organismTaxcode: state => state.organismTaxcode,
      statistics: state => state.statistics.statistics
    }),
    ...mapGetters({
      hasData: 'statistics/hasData'
    })
  },
  created () {
    this.fetchStatistics()
  },
  methods: {
    ...mapActions({
      fetchStatistics: 'statistics/fetchStatistics'
    })
  }
}
</script>

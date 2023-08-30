<template>
  <v-simple-table dense>
    <tbody v-if="hasData">
      <tr>
        <td>
          {{
            statistics[organismTaxcode].VIA_ASSAY_COUNT
              .DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode].VIA_ASSAY_COUNT
              .VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode].BIO_ASSAY_COUNT
              .DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode].BIO_ASSAY_COUNT
              .VALUE
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

<style>

</style>

<template>
  <v-simple-table dense>
    <tbody v-if="hasData">
      <tr>
        <td>Coverage:</td>
        <td>
          {{ proteomeCoverage }} %
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                small
                v-bind="attrs"
                v-on="on"
              >
                info
              </v-icon>
            </template>
            <span>SwissProt Only</span>
          </v-tooltip>
        </td>
      </tr>

      <tr>
        <td>Proteins:</td>
        <td>
          {{
            statistics[organismTaxcode]
              .IDENTIFIED_PROTEIN_COUNT.VALUE
          }}
          of
          {{
            statistics[organismTaxcode]
              .TOTAL_PROTEIN_COUNT.VALUE
          }}
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                small
                v-bind="attrs"
                v-on="on"
              >
                info
              </v-icon>
            </template>
            <span>SwissProt Only</span>
          </v-tooltip>
        </td>
      </tr>

      <tr>
        <td>Isoforms:</td>
        <td>
          {{
            statistics[organismTaxcode]
              .IDENTIFIED_ISOFORM_COUNT.VALUE
          }}
          of
          {{
            statistics[organismTaxcode]
              .TOTAL_ISOFORM_COUNT.VALUE
          }}
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                small
                v-bind="attrs"
                v-on="on"
              >
                info
              </v-icon>
            </template>
            <span>SwissProt and TrEMBL</span>
          </v-tooltip>
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .ISOFORM_UNIQUE_PEPTIDE_COUNT.DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .ISOFORM_UNIQUE_PEPTIDE_COUNT.VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .PROTEIN_UNIQUE_PEPTIDE_COUNT.DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .PROTEIN_UNIQUE_PEPTIDE_COUNT.VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode].PEPTIDE_COUNT
              .DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode].PEPTIDE_COUNT
              .VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode].SPECTRA_COUNT
              .DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode].SPECTRA_COUNT
              .VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .SYNTHETIC_REFERENCE_SPECTRA_COUNT.DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .SYNTHETIC_REFERENCE_SPECTRA_COUNT.VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .PREDICTED_REFERENCE_SPECTRA_COUNT.DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .PREDICTED_REFERENCE_SPECTRA_COUNT.VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .TISSUE_COUNT_PROTEIN.DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .TISSUE_COUNT_PROTEIN.VALUE
          }}
        </td>
      </tr>

      <tr>
        <td>
          {{
            statistics[organismTaxcode]
              .QUANTITATIVE_PROTEOMICS_DATA_POINTS.DISPLAY_NAME
          }}:
        </td>
        <td>
          {{
            statistics[organismTaxcode]
              .QUANTITATIVE_PROTEOMICS_DATA_POINTS.VALUE
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
    }),
    proteomeCoverage () {
      if (!this.statistics[this.organismTaxcode]) {
        return 0
      }

      return (
        (this.statistics[this.organismTaxcode]
          .IDENTIFIED_PROTEIN_COUNT.VALUE /
          this.statistics[this.organismTaxcode]
            .TOTAL_PROTEIN_COUNT.VALUE) *
        100
      ).toFixed(1)
    }
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

<template>
  <v-row
    v-if="hasData"
  >
    <v-col
      cols="12"
      md="6"
    >
      <v-card elevation="0">
        <v-card-title>
          <h2 class="text-h5">
            Protein Summary
          </h2>
        </v-card-title>
        <v-card-text>
          <v-simple-table>
            <tbody>
              <tr>
                <td>Gene Name</td>
                <td>
                  {{ summaryData.GENE_NAME }} <v-chip class="ma-1">
                    Gene Relatives
                  </v-chip>
                </td>
              </tr>
              <tr>
                <td>Organism</td>
                <td>{{ summaryData.ORGANISM }}</td>
              </tr>
              <tr>
                <td>Localization</td>
                <td>{{ summaryData.LOCALIZATION }}</td>
              </tr>
              <tr>
                <td>UniProt AC/ID</td>
                <td>
                  {{ summaryData.UNIPROT_AC }} / {{ summaryData.UNIPROT_ID }} <v-chip class="ma-1">
                    Isoforms
                  </v-chip>
                </td>
              </tr>
              <tr>
                <td>Evidence</td>
                <td>
                  {{ summaryData.PROTEIN_EVIDENCE }}
                  <img :src="summaryData.PROTEIN_EVIDENCE === 'protein' ? green : (summaryData.PROTEIN_EVIDENCE === 'isoform' ? yellow : red)">
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col
      cols="12"
      md="6"
    >
      <v-card elevation="0">
        <v-card-title>
          <h2 class="text-h5">
            Protein Statistics
          </h2>
        </v-card-title>
        <v-card-text>
          <v-simple-table>
            <tbody>
              <tr
                v-for="item in statistics"
                :key="item.name"
              >
                <td>
                  {{ item.name }}
                </td>
                <td>
                  {{ item.value }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col
      cols="12"
      md="6"
    >
      <v-card elevation="0">
        <v-card-title>
          <h2 class="text-h5">
            GO Annotations
          </h2>
        </v-card-title>
        <v-card-text>
          <v-simple-table
            v-if="summaryData.SUBC_LOC_INFO.length +
              summaryData.MOL_FUNC_INFO.length +
              summaryData.BIO_PROC_INFO.length
              > 0"
          >
            <tbody>
              <tr v-if="summaryData.SUBC_LOC_INFO.length>0">
                <td>Subcellular Localization</td>
                <td>
                  <v-chip
                    v-for="(item, i) in subcellLoc"
                    :key="i"
                    class="ma-1"
                    target="_blank"
                    :href="summaryData.SUBC_LOC_INFO[i].GO_LINK"
                  >
                    {{ item }}
                  </v-chip>
                </td>
              </tr>
              <tr v-if="summaryData.MOL_FUNC_INFO.length>0">
                <td>Molecular Function</td>
                <td>
                  <v-chip
                    v-for="(item, i) in molFunc"
                    :key="i"
                    class="ma-1"
                    target="_blank"
                    :href="summaryData.MOL_FUNC_INFO[i].GO_LINK"
                  >
                    {{ item }}
                  </v-chip>
                </td>
              </tr>
              <tr v-if="summaryData.BIO_PROC_INFO.length>0">
                <td>Biological Process</td>
                <td>
                  <v-chip
                    v-for="(item, i) in bioProc"
                    :key="i"
                    class="ma-1"
                    target="_blank"
                    :href="summaryData.BIO_PROC_INFO[i].GO_LINK"
                  >
                    {{ item }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col
      cols="12"
      md="6"
    >
      <v-card elevation="0">
        <v-card-title>
          <h2 class="text-h5">
            External Links
          </h2>
        </v-card-title>
        <v-card-text>
          <v-simple-table>
            <tbody>
              <tr
                v-for="[i, item] in summaryData.LINKS.entries()"
                :key="i"
                :href="item.LINK"
                color="primary"
                class="text-wrap"
              >
                <td>
                  <a
                    :href="item.LINK"
                    class="text-body-2"
                  >
                    {{ item.LINK }}</a>
                </td>
              </tr><tr />
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="6"
    >
      <ProteinExpressionBodymapWrapper
        ref="bodymap"
        color="primary lighten-2"
        show-toolbar
        :protein-id="proteinId"
        omics-type="Proteomics"
        quantification="MS1"
        calculation="iBAQ"
        tissue_category="tissue;cell+line;fluid"
        scope="1"
        group_by_tissue="1"
        :selected-organism="$store.getters.getOrganism"
        class="protein-expression-bodymap"
      />
    </v-col>
    <v-col
      cols="12"
      lg="6"
    >
      <the-sequence-coverage :protein-id="proteinId" />
    </v-col>
  </v-row>
  <v-row v-else>
    <loading-overlay loading />
  </v-row>
</template>

<script>
import TheSequenceCoverage from '@/components/partials/protein/TheSequenceCoverage'
import ProteinExpressionBodymapWrapper from '@/vue-d3-component-wrappers/ProteinExpressionBodymapWrapper'
import LoadingOverlay from '@/components/LoadingOverlay'
import { mapGetters } from 'vuex'

export default {
  components: {
    ProteinExpressionBodymapWrapper,
    TheSequenceCoverage,
    LoadingOverlay
  },
  data: () => ({
    green: require('@/assets/commons/green.png'),
    yellow: require('@/assets/commons/yellow.png'),
    red: require('@/assets/commons/red.png')
  }),
  computed: {
    ...mapGetters({
      proteinId: 'protein/getProteinId',
      proteinInfo: 'protein/getProteinInfo',
      summaryData: 'protein/proteinSummary/getData',
      hasData: 'protein/proteinSummary/hasData'
    }),
    /** @returns {string[]} */
    subcellLoc () {
      return this.summaryData.SUBC_LOC
        .split('\n ')
        .map(x => x.replace('\n', ''))
        .filter(y => y !== '')
    },
    /** @returns {string[]} */
    molFunc () {
      return this.summaryData.MOL_FUNC
        .split('\n ')
        .map(x => x.replace('\n', ''))
        .filter(y => y !== '')
    },
    /** @returns {string[]} */
    bioProc () {
      return this.summaryData.BIO_PROC
        .split('\n ')
        .map(x => x.replace('\n', ''))
        .filter(y => y !== '')
    },
    /** @returns {{ name: string, value: any }[]} */
    statistics () {
      return [
        { name: 'Coverage', value: this.summaryData.SEQUENCE_COVERAGE + '%' },
        { name: 'Unique Peptides', value: this.summaryData.UNIQUE_PEPTIDES },
        { name: 'Unique Peptide Spectra', value: this.summaryData.UNIQUE_PEPTIDES_SPECTRA },
        { name: 'Unique Peptides on Protein Level', value: this.summaryData.UNIQUE_PEPTIDES_PROTEIN }
      ]
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

<template>
  <v-row>
    <loading-overlay :loading="!hasChemblData" />
    <v-col cols="12">
      <v-row>
        <v-col cols="12">
          <v-alert
            color="blue-grey"
            text
            icon="mdi-exclamation"
            prominent
          >
            Please note that the tabs 'ddPTM' and 'dd Proteins' might take up to 15 seconds to load, depending on your internet connection.<br>
            Also be aware that only <b>regulated</b> peptides and proteins are shown there, since the webpage cannot handle displaying all data at once.<br>
            If you are interested in unregulated curves for a certain drug/protein-combination, please visit the respective protein-centric page.
          </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          lg="6"
          style="position: relative;"
        >
          <v-card
            v-if="hasChemblData"
            elevation="0"
          >
            <v-card-title>
              <h2 class="text-h5">
                Drug Summary
              </h2>
            </v-card-title>
            <v-card-text>
              <v-simple-table>
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>{{ chemblData.pref_name || drugName || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>ChEMBL ID</td>
                    <td>
                      <v-chip
                        v-if="!!chemblData && !!chemblData.molecule_chembl_id"
                        class="ma-1"
                        target="_blank"
                        :href="'https://www.ebi.ac.uk/chembl/compound_report_card/' + chemblData.molecule_chembl_id"
                      >
                        {{ chemblData.molecule_chembl_id }}
                      </v-chip>
                      <v-chip v-else>
                        Not found
                      </v-chip>
                    </td>
                  </tr>
                  <tr v-if="chemblData.molecule_properties">
                    <td>Molecular Formula</td>
                    <td>{{ chemblData.molecule_properties.full_molformula }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          lg="6"
        >
          <v-card elevation="0">
            <v-card-title>
              <h2 class="text-h5">
                Representations
              </h2>
            </v-card-title>
            <v-card-text>
              <v-simple-table v-if="chemblData.molecule_structures">
                <tbody>
                  <tr>
                    <td>SMILES</td>
                    <td>{{ chemblData.molecule_structures.canonical_smiles }}</td>
                  </tr>
                  <tr>
                    <td>InChi</td>
                    <td>{{ chemblData.molecule_structures.standard_inchi }}</td>
                  </tr>
                  <tr>
                    <td>InChi Key</td>
                    <td>{{ chemblData.molecule_structures.standard_inchi_key }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
              <template v-else>
                <v-alert
                  color="grey"
                  icon="mdi mdi-cancel"
                  dark
                >
                  No representations available
                </v-alert>
              </template>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          v-if="chemblData.molecule_structures"
          cols="12"
          md="6"
        >
          <v-card elevation="0">
            <v-card-title>
              <h2 class="text-h5">
                Properties
              </h2>
            </v-card-title>
            <v-card-text>
              <v-simple-table>
                <tbody>
                  <tr>
                    <td>Molecular Weight</td>
                    <td>{{ chemblData.molecule_properties.full_mwt || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>Monoisotopic Weight</td>
                    <td>{{ chemblData.molecule_properties.mw_monoisotopic || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>CX Most Acidic pKa</td>
                    <td>{{ chemblData.molecule_properties.cx_most_apka || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>CX Most Basic pKa</td>
                    <td>{{ chemblData.molecule_properties.cx_most_bpka || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>CX logP</td>
                    <td>{{ chemblData.molecule_properties.cx_logp || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>CX logD</td>
                    <td>{{ chemblData.molecule_properties.cx_logd || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>AlogP</td>
                    <td>{{ chemblData.molecule_properties.alogp || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>Rotatable Bonds</td>
                    <td>{{ chemblData.molecule_properties.rtb || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>Aromatic Rings</td>
                    <td>{{ chemblData.molecule_properties.aromatic_rings || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>Heavy Atoms</td>
                    <td>{{ chemblData.molecule_properties.heavy_atoms || "n/a" }}</td>
                  </tr>
                  <tr>
                    <td>Polar Surface Area</td>
                    <td>{{ chemblData.molecule_properties.psa || "n/a" }}</td>
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
                Chemical Structure
              </h2>
            </v-card-title>
            <v-card-text>
              <smiles-drawer
                v-if="smiles"
                :smiles="smiles"
                class="smiles-drawer"
              />
              <v-alert
                v-else
                color="grey"
                icon="mdi mdi-cancel"
                dark
                max-width="300px"
              >
                No chemical structure available
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          v-if="hasStatisticsData"
          cols="12"
        >
          <v-divider class="mt-3 mb-9" />
          <v-row>
            <v-col cols="12">
              <v-card elevation="0">
                <v-card-title>
                  <h2 class="text-h5">
                    decryptM/decryptE Experiments Involving this Drug
                  </h2>
                </v-card-title>
                <v-card-text>
                  <drug-ddptm-table-experiments
                    :data-source="statistics.curvesByExperiment"
                  />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              sm="4"
            >
              <v-card elevation="0">
                <v-card-title>
                  <h2>Top Genes (By decryptM Curves)</h2>
                </v-card-title>
                <v-card-text>
                  <drug-top-proteins-table :data-source="statistics.topProteinsByDecryptMCurves" />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              sm="4"
            >
              <v-card elevation="0">
                <v-card-title>
                  <h2>Top Genes (By decryptE Curves)</h2>
                </v-card-title>
                <v-card-text>
                  <drug-top-proteins-table :data-source="statistics.topProteinsByDecryptECurves" />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              sm="4"
            >
              <v-card elevation="0">
                <v-card-title>
                  <h2>Top Targets (By Kinobeads & HDAC Beads)</h2>
                </v-card-title>
                <v-card-text>
                  <drug-top-protein-targets-table :data-source="statistics.topTargets" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

import LoadingOverlay from '@/components/LoadingOverlay.vue'
import SmilesDrawer from '@/components/SmilesDrawer.vue'
import DrugDdptmTableExperiments from '@/components/DrugDDPTMTableExperiments.vue'
import DrugTopProteinsTable from '@/components/DrugTopProteinsTable.vue'
import DrugTopProteinTargetsTable from '@/components/DrugTopProteinTargetsTable.vue'

export default {
  name: 'DrugSummary',
  components: {
    SmilesDrawer,
    LoadingOverlay,
    DrugDdptmTableExperiments,
    DrugTopProteinsTable,
    DrugTopProteinTargetsTable
  },
  computed: {
    ...mapGetters({
      hasChemblData: 'drug/summary/hasChemblData',
      hasStatisticsData: 'drug/summary/hasStatisticsData',
      drugName: 'drug/getDrugName'
    }),
    /** @returns {any} */
    chemblData () {
      return this.$store.getters['drug/summary/getChemblData']
    },
    /** @returns {any[]} */
    refList () {
      return this.$store.getters['drug/summary/getChemblRefList']
    },
    /** @returns {any} */
    smiles () {
      return (this.chemblData && this.chemblData.molecule_structures)
        ? this.chemblData.molecule_structures.canonical_smiles
        : null
    },
    /** @returns {any} */
    statistics () {
      return this.$store.getters['drug/summary/getStatisticsData']
    }
  }
}
</script>

<style lang="scss" scoped>
h2 {
  font-size: 14pt;
  color: #5b5b5b;
}

.smiles-drawer {
  max-width: 500px;
}
</style>

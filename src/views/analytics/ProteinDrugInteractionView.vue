<template>
  <v-container>
    <v-row class="protein-drug-interaction-view">
      <v-col class="d-flex pr-16 mb-4">
        <h1>Protein-Drug Interaction Analysis</h1>

        <DownloadSpeedDial
          absolute
          right
          svg
          png
          @svg="downloadPlot('svg')"
          @png="downloadPlot('png')"
        />
      </v-col>

      <v-col cols="12">
        <v-card
          elevation="0"
        >
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                lg="6"
              >
                <v-textarea
                  v-model="proteins"
                  class="mb-4"
                  label="Proteins:"
                  placeholder="Separate multiple proteins by comma. Each protein search string should have at least three alphanumerics. You may use an asterisk (*) to match an arbitrary pre- or suffix. Quotation marks are not allowed."
                  persistent-placeholder
                  style="background-color: #ffffff"
                  outlined
                />
              </v-col>

              <v-col
                cols="12"
                lg="6"
              >
                <v-combobox
                  v-model="drugs"
                  class="mb-4"
                  :items="drugList"
                  :menu-props="{ maxHeight: '400' }"
                  label="Drugs:"
                  multiple
                  hint="Select all drugs you want to show in the interaction graph"
                  persistent-hint
                  chips
                  clearable
                  style="background-color: #ffffff"
                  outlined
                />
              </v-col>
            </v-row>
            <v-card-actions>
              <v-btn
                color="primary"
                class="px-16"
                @click="onClick"
              >
                Search
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <ProteinDrugInteractionWrapper
          ref="InteractionWrapper"
          :min-height="350"
          :min-width="500"
          :graph-data="graphData"
          :selected-drugs="selectedDrugs"
          :catds-data="catdsData"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import ProteinDrugInteractionWrapper from '@/vue-d3-component-wrappers/ProteinDrugInteractionWrapper'
import DownloadSpeedDial from '@/components/DownloadSpeedDial'
import utils from '../../utils/downloadUtils'

export default {
  name: 'ProteinDrugInteractionView',
  components: {
    ProteinDrugInteractionWrapper,
    DownloadSpeedDial
  },
  data () {
    return {
      drugList: [{ text: 'Foo', value: 42 }, { text: 'Bar', value: 43 }, {
        text: 'Baz', value: 44
      }],
      proteins: '',
      drugs: [],
      graphData: undefined,
      selectedDrugs: [],
      catdsData: undefined
    }
  },
  created () {
    axios.get(this.$store.state.host + '/logic/validatedInhibitors.xsjs').then((response) => {
      this.drugList = response.data.map((elem) => {
        return { text: elem.treatment, value: elem.drugId }
      }).sort((a, b) => (a.text > b.text) ? 1 : -1)
    })
  },
  methods: {
    onClick: async function () {
      let proteinString = ''
      proteinString = this.validateProteinSearchString(this.proteins)
      const drugstring = this.drugs.map((elem) => elem.value).join(';')

      const catdsResponse = await axios.get(this.$store.state.host + '/logic/catds/getCatds.xsjs', {
        params: {
          protein: proteinString,
          taxcode: this.$store.state.organismTaxcode
        }
      })
      this.catdsData = catdsResponse.data

      const combiTreatmentResponse = await axios.get(this.$store.state.host + '/logic/combinationTreatment.xsjs', {
        params: {
          proteins: proteinString,
          drugIds: drugstring
        }
      })
      this.graphData = combiTreatmentResponse.data

      if (this.graphData.proteins.length === 0) {
        alert('Your search returned no results!')
      }
      this.selectedDrugs = this.drugs
    },

    /**
     * Check search string for correct syntax and return cleaned string of ';' separated protein names
     * @param  {string} searchString comma separated string of proteins
     * @return {string[]}               Array of cleaned protein names
     */
    validateProteinSearchString: function (searchString) {
      // whitespace is no separator
      const proteins = searchString.split(/[\f]|[\n]|[\t]|[\v]|[,]|[;]/)
      for (let i = 0; i < proteins.length; i++) {
        // proteins[i] must not contain quotation marks
        if (/["]/.test(proteins[i])) {
          return false
        }
        // proteins[i] must have at least 3 letters or digits
        if (proteins[i].length - proteins[i].split(/[a-z]|[\d]/i).join('').length < 3) {
          return false
        }
      }
      return proteins.join(';')
    },
    downloadPlot: function (type) {
      const plots = [this.$refs.InteractionWrapper.getSVG()]
      utils.downloadSVGs(plots,
        'Drug Protein Interaction Map',
        type === 'svg',
        undefined,
        [require('../../vue-d3-components/ProteinDrugInteractionGraph.css.prdb')])
    }

  }
}
</script>

<style>
</style>

<template>
  <div>
    <LoadingOverlay :loading="loading" />

    <D3ViolinPlot
      id="violinPlot"
      ref="violinPlot"
      :plot-height="height"
      :plot-width="violinWidth"
      :chart-data="violinData"
      :selected-element="selectedTargetProteinIdString"
      :clipped-selection-line="clippedSelectionLine"
      :key-value="keyValue"
      :plot-label-value-drug="drugLabelField"
      :plot-label-value-catds="catdsLabelField.toString()"
      :property-path="propertyPath"
      :data-path="dataPath"
      :value-path="valuePath"
      :font-family="fontFamily"
      :font-size="fontSize"
      :resolution="resolution"
      :simple-label="simpleLabel"
      @select-violin="onSelectDrug"
    />
  </div>
</template>

<script>
import axios from 'axios'
import LoadingOverlay from '@/components/LoadingOverlay'
import D3ViolinPlot from './D3ViolinPlot'
import downloadUtils from '../../utils/downloadUtils'

export default {
  name: 'SelectivityViolinPlot',
  components: {
    D3ViolinPlot,
    LoadingOverlay
  },
  props: {
    height: {
      type: Number,
      default: 300
    },
    violinWidth: {
      type: Number,
      default: 200
    },
    ed50Min: {
      type: Number,
      default: null
    },
    ed50Max: {
      type: Number,
      default: null
    },
    r2Min: {
      type: Number,
      default: null
    },
    drugIdSelection: {
      type: Array,
      default: () => {
        return []
      }
    },
    selectedTargetProtein: {
      type: Object,
      default: () => {
        return {}
      }
    },
    clippedSelectionLine: {
      type: Boolean,
      default: false
    },
    keyValue: {
      type: String,
      default: 'DRUG_ID'
    },
    plotLabelValueDrug: {
      type: String,
      default: 'TREATMENT'
    },
    plotLabelValueCatds: {
      type: String,
      default: '0'
    },
    propertyPath: {
      type: String,
      default: 'PROTEIN_ID'
    },
    dataPath: {
      type: String,
      default: 'data'
    },
    valuePath: {
      type: String,
      default: 'VALUE'
    },
    fontFamily: {
      type: String,
      default: 'Arial,Helvetica,sans-serif'
    },
    fontSize: {
      type: String,
      default: '12px'
    },
    resolution: {
      type: Number,
      default: 20
    },
    simpleLabel: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: false,
      violinData: null,
      selectedElement: undefined,
      drugLabelField: 'TREATMENT',
      catdsLabelField: 0,
      abortController: null
    }
  },
  computed: {
    /** @returns {string} */
    violinPlotTitle: function () {
      return `pEC50 distribution of drugs targeting
      ${this.selectedTargetProtein.protein_name} (${this.selectedTargetProtein.unique_identifier})`
    },
    /** @returns {string} */
    selectedTargetProteinIdString: function () {
      return this.selectedTargetProtein.protein_id.toString()
    }
  },
  watch: {
    ed50Min () {
      this.getData()
    },
    ed50Max () {
      this.getData()
    },
    r2Min () {
      this.getData()
    },
    chartData () {
      this.getData()
    },
    drugIdSelection () {
      this.getData()
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    async getData () {
      try {
        this.loading = true

        if (this.abortController) {
          this.abortController.abort()
        }
        this.abortController = new AbortController()

        const url = `${this.$store.state.host + '/logic/getViolinData.xsjs'}`

        const response = await axios.get(url, {
          params: {
            ed50_min: this.ed50Min,
            ed50_max: this.ed50Max,
            r2_min: this.r2Min,
            drug_id_selection: this.drugIdSelection.join(';')
          },
          signal: this.abortController.signal
        })

        const drugData = response.data

        const { data: catdsData } = await axios.get(`${this.$store.state.host}/logic/catds/getCatds.xsjs`, {
          params: {
            protein: this.selectedTargetProtein.protein_name,
            taxcode: this.$store.state.organismTaxcode
          },
          signal: this.abortController.signal
        })

        const unsortedViolinData = drugData.map(drug => {
          const matchingCatds = catdsData.filter(catds => {
            return catds.DRUG_EXPERIMENTAL_FACTOR_CV_ID === drug.DRUG_ID
          }).pop()
          this.drugLabelField = 'treatment'
          this.catdsLabelField = 'treatment_catds'

          return {
            ...drug,
            catds: matchingCatds ? matchingCatds.CATDS : '0.0',
            treatment: matchingCatds ? `${drug.TREATMENT}` : drug.TREATMENT,
            treatment_catds: matchingCatds ? `(${matchingCatds.CATDS.toFixed(4)})` : drug.TREATMENT
          }
        })
        this.violinData = unsortedViolinData.sort((a, b) => {
          // Descending
          if (a.catds < b.catds) return 1
          if (a.catds > b.catds) return -1
          return 0
        })
      } catch (e) {
        if (!axios.isCancel(e)) {
          this.violinData = null
          // eslint-disable-next-line no-console
          console.error(e)
        }
      } finally {
        this.loading = false
      }
    },
    onSelectDrug: function (e) {
      this.$emit('select-drug', e)
    },
    getSVG: function () {
      return this.$refs.violinPlot.getSVG()
    },
    getCSV () {
      const aData = this.violinData
      const oProtein = this.selectedTargetProtein
      const sFileName = oProtein.protein_name + ' (' + oProtein.unique_identifier + ').csv'

      const aColumnMapping = [{
        jsonProperty: 'PROTEIN_ID',
        columnName: 'Protein ID'
      }, {
        jsonProperty: 'GENE_NAME',
        columnName: 'Gene Name'
      }, {
        jsonProperty: 'VALUE',
        columnName: 'EC50 [nM]',
        formatter: function valueColumnFormatter (nValue) {
          return Math.pow(10, nValue)
        }
      }, {
        jsonProperty: 'BIC',
        columnName: 'BIC'
      }, {
        jsonProperty: 'COD',
        columnName: 'R2'
      }]

      const aCSVHeader = ['Drug'].concat(aColumnMapping.map((oColumn) => oColumn.columnName))
      const aCSVRows = []

      for (let i = 0; i < aData.length; i++) {
        const oData = aData[i].data
        for (let j = 0; j < oData.length; j++) {
          const aRow = []
          aRow.push(aData[i].TREATMENT)
          for (let k = 0; k < aColumnMapping.length; k++) {
            if (aColumnMapping[k].formatter) {
              aRow.push(aColumnMapping[k].formatter(oData[j][aColumnMapping[k].jsonProperty]))
            } else {
              aRow.push(oData[j][aColumnMapping[k].jsonProperty])
            }
          }
          aCSVRows.push(aRow)
        }
      }

      downloadUtils.downloadCSV(sFileName, aCSVRows, aCSVHeader)
    }
  }
}
</script>

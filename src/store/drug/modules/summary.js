import _ from 'lodash'
import createTabModule from '@/store/tabModuleFactory'

function getRefListFromChemblData (chemblData) {
  const refList = {}
  for (const i in chemblData.cross_references) {
    if (!(chemblData.cross_references[i].xref_src in refList)) {
      refList[chemblData.cross_references[i].xref_src] = []
    }
    refList[chemblData.cross_references[i].xref_src].push(chemblData.cross_references[i].xref_id)
  }
  return refList
}

const state = {
  data: {
    chembl: {},
    chemblRefList: {}, // Not used right now. TODO: Turn each reference into a link, since the reference only is not that useful.
    statisticsData: {}
  },
  prefetch: false,
  menu: {
    label: 'Summary'
  },
  routeName: 'drugSummary'
}

const mutations = {
  setChemblData (state, payload) {
    state.data.chembl = payload.chembl
    state.data.chemblRefList = payload.chemblRefList
  },
  setStatisticsData (state, payload) {
    state.data.statisticsData = payload
  }

}

const getters = {
  hasChemblData: state => !_.isEmpty(state.data.chembl),
  hasStatisticsData: state => !_.isEmpty(state.data.statisticsData),
  getChemblData: state => state.data.chembl,
  getChemblReflist: state => state.data.chemblRefList,
  getStatisticsData: state => state.data.statisticsData
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const chemblResponse = await $axios.get(`https://www.ebi.ac.uk/chembl/api/data/molecule/${rootState.drug.chemblId}?format=json`)
    commit('setChemblData', { chembl: chemblResponse.data, chemblRefList: getRefListFromChemblData(chemblResponse.data) })

    const statisticsResponse = await $axios.get(rootState.host + '/proteomicsdb/logic/drugcentric/getDrugStatistics.xsjs', {
      params: { drugId: rootState.drug.drugId }
    })
    commit('setStatisticsData', statisticsResponse.data)
  }
}

export default createTabModule({
  state,
  mutations,
  getters,
  actions
})

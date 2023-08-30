import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'Turnover',
    showDataCount: true
  },
  routeName: 'proteinTurnover'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/getCurveInformationByProteinID.xsjs', {
      params: {
        protein_id: rootState.protein.proteinId,
        drug_name: 'not',
        assay_type: 'PDB:101019',
        assay_variable: 'time'
      }
    })

    commit('setData', response.data)
  }
}

export default createTabModule({
  state,
  getters,
  actions
})

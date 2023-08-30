import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'dd Proteins',
    showDataCount: true
  },
  routeName: 'drugDoseDependentFP'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/drugcentric/getDDFPDrug.xsjs', {
      params: {
        drugName: rootState.drug.drugName
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

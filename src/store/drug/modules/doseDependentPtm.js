import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'ddPTM',
    showDataCount: true
  },
  routeName: 'drugDoseDependentPTMs'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.peptideLevelData.length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const [peptideLevelData, proteinLevelData] = await Promise.all([
      $axios.get(rootState.host + '/proteomicsdb/logic/drugcentric/getDDPTMDrug.xsjs', {
        params: {
          drugName: rootState.drug.drugName
        }
      }),
      $axios.get(rootState.host + '/proteomicsdb/logic/drugcentric/getDDPTMDrugProteinLevel.xsjs', {
        params: {
          drugName: rootState.drug.drugName
        }
      })]
    )

    commit('setData', { peptideLevelData: peptideLevelData.data, proteinLevelData: proteinLevelData.data })
  }
}

export default createTabModule({
  state,
  getters,
  actions
})

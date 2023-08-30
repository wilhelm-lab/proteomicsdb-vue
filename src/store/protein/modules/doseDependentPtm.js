import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'ddPTM',
    showDataCount: true
  },
  routeName: 'proteinDoseDependentPTMs'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/proteincentric/getDDPTMProtein.xsjs', {
      params: {
        proteinId: rootState.protein.proteinId
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

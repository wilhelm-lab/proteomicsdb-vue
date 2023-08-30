import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'Projects',
    showDataCount: true
  },
  routeName: 'proteinProjects'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/getProjectsByProtein.xsjs', {
      params: {
        protein_id: rootState.protein.proteinId
      }
    })

    commit('setData', response.data.EXPERIMENT_TABLE)
  }
}

export default createTabModule({
  state,
  getters,
  actions
})

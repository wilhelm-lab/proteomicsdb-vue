
import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'Proteotypicity',
    showDataCount: true
  },
  routeName: 'proteinProteotypicity'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/getQuantificationTypes.xsjs', {
      params: { protein_id: rootState.protein.proteinId }
    })
    const data = response.data.map(x => ({ text: x, value: false }))
    commit('setData', data)
  }
}

export default createTabModule({
  state,
  getters,
  actions
})

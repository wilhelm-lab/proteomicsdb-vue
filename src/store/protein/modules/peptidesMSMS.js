
import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'Peptides MS/MS',
    showDataCount: true
  },
  routeName: 'proteinPeptidesMSMS'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.PEPTIDES.length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/getPeptidesByProtein.xsjs', {
      params: { protein_id: rootState.protein.proteinId }
    })

    commit('setData', response.data)
  }
}

export default createTabModule({
  state,
  getters,
  actions
})

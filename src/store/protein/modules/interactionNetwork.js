import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'Interaction network',
    showDataCount: true
  },
  routeName: 'proteinInteractionNetwork'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.nNodes : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const accessionIdResponse = await $axios.get(rootState.host + '/proteomicsdb/logic/pathways/getAccessionId.xsjs', {
      params: { protein_id: rootState.protein.proteinId }
    })

    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/pathways/getPathwayGraphForProteinId.xsjs', {
      params: { accession_id: accessionIdResponse.data.AccessionId }
    })

    commit('setData', response.data)
  }
}

export default createTabModule({
  state,
  getters,
  actions
})

import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: true,
  menu: {
    label: 'Summary'
  },
  routeName: 'proteinSummary'
}

const actions = {
  async fetchData ({ $axios, rootState, commit }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/getProteinSummary.xsjs', {
      params: { protein_id: rootState.protein.proteinId }
    })

    commit('setData', response.data)
  }
}

export default createTabModule({
  state,
  actions
})

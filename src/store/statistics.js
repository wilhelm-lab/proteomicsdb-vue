import axios from 'axios'

const state = {
  statistics: {},
  loading: false
}

const getters = {
  hasData: state => Object.keys(state.statistics).length > 0
}

const actions = {
  async fetchStatistics ({ state, rootState }) {
    if (state.loading) {
      return
    }

    state.loading = true
    const response = await axios.get(rootState.host + '/proteomicsdb/logic/getStatistics.xsjs')
    state.statistics = response.data
    state.loading = false
  }
}

export default {
  namespaced: true,
  state,
  actions,
  getters
}

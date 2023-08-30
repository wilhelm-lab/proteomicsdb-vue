import Vue from 'vue'
import Vuex from 'vuex'
import notifications from './notifications'
import community from './community'
import protein from './protein'
import drug from './drug'
import analytics from './analytics'
import statistics from './statistics'
import dataExplorer from './dataExplorer'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    organismTaxcode: 9606,
    organisms: [
      // TODO: Remove organismcode. For this, restructure backend so organisms are saved under their taxcode, that's cleaner
      { text: 'Homo sapiens', icon: 'mdi mdi-human-greeting', taxcode: 9606 },
      { text: 'Arabidopsis thaliana', icon: '$vuetify.icons.arabidopsis', taxcode: 3702 },
      { text: 'Mus musculus', icon: 'mdi mdi-rodent', taxcode: 10090 },
      { text: 'Oryza sativa subs. japonica', icon: '$vuetify.icons.rice', taxcode: 39947 }
    ],
    host: process.env.VUE_APP_API_HOST,
    isPageLoading: false
  },
  getters: {
    getOrganism: state =>
      state.organisms.find(organism => state.organismTaxcode === organism.taxcode),
    getIsPageLoading: state => state.isPageLoading
  },
  mutations: {
    setOrganismTaxcode (state, taxcode) {
      state.organismTaxcode = taxcode
    },
    setIsPageLoading (state, isPageLoading) {
      state.isPageLoading = isPageLoading
    }
  },
  actions: {
    switchOrganism ({ state, commit, getters }, { taxcode, notifyUser }) {
      const notify = notifyUser && state.organismTaxcode !== taxcode

      commit('setOrganismTaxcode', taxcode)
      Vue.cookie.set('organism', taxcode, { expires: 14 })

      if (notify) {
        commit('notifications/addNotification', {
          color: 'secondary',
          message: `Organism switched to: ${getters.getOrganism.text}`
        })
      }
    }
  },
  modules: {
    notifications,
    community,
    protein,
    drug,
    analytics,
    statistics,
    dataExplorer
  }
})

export default store

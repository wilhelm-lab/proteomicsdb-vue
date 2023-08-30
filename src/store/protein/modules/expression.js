import _ from 'lodash'
import axios from 'axios'
import createTabModule from '@/store/tabModuleFactory'
import Vue from 'vue'

const state = {
  data: {
    selection: {
      omicsType: 'Proteomics',
      bioSources: ['tissue', 'fluid'],
      quantification: { key: 1, method: 'MS1', unit: 'iBAQ' }
    },
    omicsTypes: [],
    quantifications: {},
    bioSources: []
  },
  loadedSelection: {},
  prefetch: true,
  menu: {
    label: 'Expression',
    showDataCount: true
  },
  routeName: 'proteinExpression'
}

const mutations = {
  setOmicsTypes (state, payload) {
    state.data.omicsTypes = payload
  },
  setQuantifications (state, { omicsType, quantifications }) {
    Vue.set(state.data.quantifications, omicsType, quantifications)
  },
  setBioSources (state, { omicsType, quantification, bioSources }) {
    Vue.set(state.data.bioSources, [omicsType, quantification.method, quantification.unit].join('/'), bioSources)
  },
  setSelection (state, payload) {
    state.data.selection = payload
  },
  setLoadedSelection (state, payload) {
    const { omicsType, bioSources, quantification } = payload

    state.loadedSelection = {
      omicsType,
      tissueCategoryString: bioSources
        .map(bioSource => bioSource.replace(' ', '+'))
        .join(';'),
      quantification
    }
  }
}

const getters = {
  getOmicsTypes: state => state.data.omicsTypes,
  getQuantifications (state) {
    return omicsType => state.data.quantifications[omicsType]
  },
  getBioSources (state) {
    return (omicsType, quantification) => {
      if (!omicsType || !quantification) {
        return []
      }

      return state.data.bioSources[[omicsType, quantification.method, quantification.unit].join('/')] || []
    }
  },
  getSelection: state => state.data.selection,
  getLoadedSelection: state => state.loadedSelection,
  getDataCount (state) {
    return _.flatten(_.values(state.data.bioSources)).length
  },
  hasLoadedSelection: state => !_.isEmpty(state.loadedSelection),
  isCurrentSelectionLoaded: (state, getters) => {
    const { omicsType, bioSources, quantification } = getters.getSelection

    return _.isEqual(state.loadedSelection, {
      omicsType,
      tissueCategoryString: bioSources
        .map(bioSource => bioSource.replace(' ', '+'))
        .join(';'),
      quantification
    })
  },
  hasData: state => state.data.omicsTypes.length > 0
}

const actions = {
  async fetchData ({ getters, dispatch }) {
    await dispatch('fetchOmicsTypes')

    for (const omicsType of getters.getOmicsTypes) {
      await dispatch('fetchQuantCalc', omicsType)

      for (const quantification of getters.getQuantifications(omicsType)) {
        await dispatch('fetchAvailableBioSources', { omicsType, quantification })
      }
    }
  },
  async fetchOmicsTypes ({ getters, rootState, commit }) {
    const response = await axios.get(rootState.host + '/proteomicsdb/logic/getOmicTypesForProteinId.xsjs', {
      params: { protein_id: rootState.protein.proteinId },
      cancelToken: getters.getCancelToken
    })

    const omicsTypes = response.data.map(x => x.omicTypes)
    commit('setOmicsTypes', omicsTypes)
  },
  async fetchQuantCalc ({ getters, rootState, commit }, omicsType) {
    const response = await axios.get(rootState.host + '/proteomicsdb/logic/getOmicTypesForProteinId.xsjs', {
      params: {
        protein_id: rootState.protein.proteinId,
        omic: omicsType
      },
      cancelToken: getters.getCancelToken
    })

    commit('setQuantifications', {
      omicsType,
      quantifications: response.data
    })
  },
  async fetchAvailableBioSources ({ rootState, commit }, { omicsType, quantification }) {
    if (!omicsType || !quantification) {
      return
    }

    const response = await axios.get(rootState.host + '/proteomicsdb/logic/checkDataAvailability.xsjs', {
      params: {
        protein_id: rootState.protein.proteinId,
        omic: omicsType,
        quant: quantification.method,
        calc: quantification.unit
      }
    })

    const bioSources = response.data.data
      .filter(x => x.scope === 1 && x.tissueCategory !== '')
      .map(x => x.tissueCategory)
      // TODO: reduce really necessary? maybe refactor to more readable code
      .reduce((p, n) => { return p.indexOf(n) === -1 ? p.concat(n) : p }, [])

    commit('setBioSources', {
      omicsType,
      quantification,
      bioSources
    })
  },
  updateSelection ({ getters, dispatch }, selection) {
    dispatch('ensureValidSelection', {
      ...getters.getSelection,
      ...selection
    })
  },
  ensureValidSelection ({ commit, getters }, selection) {
    selection = selection || {}
    const omicsType = selection.omicsType || getters.getOmicsTypes[0]

    const validQuantifications = getters.getQuantifications(omicsType)
    let quantification = selection.quantification || validQuantifications[0]
    if (!validQuantifications.includes(quantification)) {
      quantification = validQuantifications[0]
    }

    const validBioSources = getters.getBioSources(omicsType, quantification)
    let bioSources = selection.bioSources || [validBioSources[0]]
    bioSources = _.intersection(bioSources, validBioSources)

    commit('setSelection', {
      omicsType,
      quantification,
      bioSources
    })
  }
}

export default createTabModule({
  state,
  getters,
  actions,
  mutations
})

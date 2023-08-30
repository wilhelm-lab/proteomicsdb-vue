import createTabModule from '@/store/tabModuleFactory'

const MAX_MISSED_CLEAVAGES = 5

const state = {
  prefetch: true,
  menu: {
    label: 'Protease Map',
    showDataCount: true
  },
  routeName: 'proteinProteaseMap',

  data: {
    minPeptideLength: 0,
    maxPeptideLength: 0,
    minPeptideMass: 0,
    maxPeptideMass: 0,
    minMissedCleavages: 0,
    maxMissedCleavages: MAX_MISSED_CLEAVAGES,
    allowedProteases: []
  },

  configUrl: '',

  selection: {
    proteases: [],
    peptideLength: {
      min: 0,
      max: 0
    },
    peptideMass: {
      min: 0,
      max: 0
    },
    missedCleavages: 0,
    includeDetected: true
  }
}

const getters = {
  isDisabled: (state, getters, rootState) => !rootState.protein.proteinInfo.uniprotId,
  getDataCount: (state, getters) => getters.hasData ? state.data.allowedProteases.length : 0,
  getSelection: state => state.selection,
  getConfigUrl: state => state.configUrl,
  getSelectedProteases: state => state.selection.proteases,
  getSelectedPeptideLengthMin: state => state.selection.peptideLength.min,
  getSelectedPeptideLengthMax: state => state.selection.peptideLength.max,
  getSelectedPeptideMassMin: state => state.selection.peptideMass.min,
  getSelectedPeptideMassMax: state => state.selection.peptideMass.max,
  getSelectedMissedCleavages: state => state.selection.missedCleavages,
  getSelectedIncludeDetected: state => state.selection.includeDetected,
  getAllowedProteases: state => state.data.allowedProteases,
  getMinMissedCleavages: state => state.data.minMissedCleavages,
  getMaxMissedCleavages: state => state.data.maxMissedCleavages,
  getMinPeptideLength: state => state.data.minPeptideLength,
  getMaxPeptideLength: state => state.data.maxPeptideLength,
  getMinPeptideMass: state => state.data.minPeptideMass,
  getMaxPeptideMass: state => state.data.maxPeptideMass,
  getSelectedPeptideMassRange: state => [state.selection.peptideMass.min, state.selection.peptideMass.max],
  getSelectedPeptideLengthRange: state => [state.selection.peptideLength.min, state.selection.peptideLength.max]
}

const mutations = {
  setSelection: (state, payload) => { state.selection = payload },
  setConfigUrl: (state, payload) => { state.configUrl = payload },
  setSelectedProteases: (state, payload) => { state.selection.proteases = payload },
  setSelectedPeptideLengthMin: (state, payload) => { state.selection.peptideLength.min = payload },
  setSelectedPeptideLengthMax: (state, payload) => { state.selection.peptideLength.max = payload },
  setSelectedPeptideMassMin: (state, payload) => { state.selection.peptideMass.min = payload },
  setSelectedPeptideMassMax: (state, payload) => { state.selection.peptideMass.max = payload },
  setSelectedMissedCleavages: (state, payload) => { state.selection.missedCleavages = payload },
  setSelectedIncludeDetected: (state, payload) => { state.selection.includeDetected = payload },
  setSelectedPeptideMassRange: (state, payload) => {
    state.selection.peptideMass.min = payload[0]
    state.selection.peptideMass.max = payload[1]
  },
  setSelectedPeptideLengthRange: (state, payload) => {
    state.selection.peptideLength.min = payload[0]
    state.selection.peptideLength.max = payload[1]
  }
}

const actions = {
  async fetchData ({ $axios, rootState, commit, state }) {
    const response = await $axios.get(rootState.host + '/proteomicsdb/logic/getProteaseMapSelectionValues.xsjs', {
      params: { protein_id: rootState.protein.proteinId }
    })

    const {
      MIN_LENGTH, MAX_LENGTH,
      MIN_MASS,
      MAX_MASS,
      PROTEASE_TABLE
    } = response.data

    const data = {
      ...state.data,
      minPeptideLength: MIN_LENGTH,
      maxPeptideLength: MAX_LENGTH,
      minPeptideMass: MIN_MASS,
      maxPeptideMass: MAX_MASS,
      allowedProteases: PROTEASE_TABLE.map(prot => prot.PROTEASE.NAME)
    }

    const selection = {
      ...state.selection,
      peptideLength: { min: data.minPeptideLength, max: data.maxPeptideLength },
      peptideMass: { min: data.minPeptideMass, max: data.maxPeptideMass }
    }

    commit('setData', data)
    commit('setSelection', selection)
  },

  updateConfigUrl ({ rootState, state, commit }) {
    commit('setLoading', true)

    const url = `${rootState.host}/proteomicsdb/logic/featureViewer/getProteaseMapConfig.xsjs` +
          `?accession=${rootState.protein.proteinInfo.uniprotId}` +
          `&protein_id=${rootState.protein.proteinId}` +
          `&minLength=${state.selection.peptideLength.min}` +
          `&maxLength=${state.selection.peptideLength.max}` +
          `&minMass=${state.selection.peptideMass.min}` +
          `&maxMass=${state.selection.peptideMass.max}` +
          `&missedCleavages=${state.selection.missedCleavages}` +
          `&peptideTypes=${state.selection.includeDetected ? 'Detected,' : ''}${state.selection.proteases.join(',')}`

    commit('setConfigUrl', url)
    commit('setLoading', false)
  }
}

export default createTabModule({
  state,
  getters,
  mutations,
  actions
})

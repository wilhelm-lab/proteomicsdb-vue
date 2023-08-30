import createTabWrapperModule from '@/store/tabWrapperModuleFactory'

import proteinSummary from './modules/proteinSummary'
import featureViewer from './modules/featureViewer'
import peptidesMSMS from './modules/peptidesMSMS'
import referencePeptides from './modules/referencePeptides'
import proteotypicity from './modules/proteotypicity'
import proteaseMap from './modules/proteaseMap'
import fdr from './modules/fdr'
import expression from './modules/expression'
import interactionNetwork from './modules/interactionNetwork'
import inhibitors from './modules/inhibitors'
import meltome from './modules/meltome'
import turnover from './modules/turnover'
import projects from './modules/projects'
import doseDependentPtm from './modules/doseDependentPtm'
import doseDependentFp from './modules/doseDependentFp'
import timeDependentPtm from './modules/timeDependentPtm'
import timeDependentFp from './modules/timeDependentFp'
import axios from 'axios'

const modules = {
  proteinSummary,
  featureViewer,
  peptidesMSMS,
  referencePeptides,
  proteotypicity,
  proteaseMap,
  fdr,
  expression,
  interactionNetwork,
  inhibitors,
  meltome,
  turnover,
  cellPerturbation: {
    namespaced: true,
    modules: {
      doseDependentPtm,
      doseDependentFp,
      timeDependentPtm,
      timeDependentFp
    },
    label: 'Cell Perturbation',
    icon: 'mdi mdi-bacteria-outline'
  },
  projects
}

const state = {
  proteinId: 0,
  proteinInfo: {
    name: '',
    uniprotId: '',
    title: ''
  }
}

const mutations = {
  setProteinId (state, proteinId) {
    state.proteinId = proteinId
  },
  setProteinInfo (state, { name, uniprotId, title }) {
    state.proteinInfo = { name, uniprotId, title }
  }
}

const getters = {
  getProteinId: state => state.proteinId,
  getProteinInfo: state => state.proteinInfo
}

const actions = {
  switchProtein ({ getters, commit, dispatch }, proteinId) {
    if (proteinId !== getters.getProteinId) {
      dispatch('resetAllModules')
      commit('setProteinId', proteinId)
      dispatch('autoSwitchOrganism', proteinId)
      dispatch('fetchProteinInfo')
    }
  },
  async fetchProteinInfo ({ commit, dispatch, getters }) {
    await dispatch('proteinSummary/fetchData')
    const summaryData = getters['proteinSummary/getData']
    commit('setProteinInfo', {
      name: summaryData.GENE_NAME,
      uniprotId: summaryData.UNIPROT_UNIQUE_IDENTIFIER,
      title: `${summaryData.PROTEIN}`
    })
  },
  async autoSwitchOrganism ({ dispatch, rootState }, proteinId) {
    const response = await axios.get(
      `${rootState.host}/proteomicsdb/logic/api_v2/api.xsodata/Protein(${proteinId})?$format=json&$select=TAXCODE`
    )
    const taxcode = response.data.d.TAXCODE
    dispatch('switchOrganism', { taxcode, notifyUser: true }, { root: true })
  }
}

export default createTabWrapperModule({
  namespaced: true,
  state,
  mutations,
  getters,
  actions,
  modules
})

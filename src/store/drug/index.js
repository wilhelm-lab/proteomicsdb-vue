import axios from 'axios'

import createTabWrapperModule from '@/store/tabWrapperModuleFactory'
import summary from './modules/summary'
import doseDependentPtm from './modules/doseDependentPtm'
import doseDependentFp from './modules/doseDependentFp'
import targets from './modules/targets'

const modules = {
  summary,
  cellPerturbation: {
    namespaced: true,
    modules: {
      doseDependentPtm,
      doseDependentFp
    },
    label: 'Cell Perturbation',
    icon: 'mdi mdi-bacteria-outline'
  },
  targets
}

const state = {
  drugId: 0,
  drugName: '',
  chemblId: ''
}

const mutations = {
  setDrugId (state, drugId) {
    state.drugId = drugId
  },
  setDrugName (state, drugName) {
    state.drugName = drugName
  },
  setChemblId (state, chemblId) {
    state.chemblId = chemblId
  }
}

const getters = {
  getDrugId: state => state.drugId,
  getDrugName: state => state.drugName,
  getChemblId: state => state.chemblId,
  hasDrugInfo: state => state.drugId > 0 && state.drugName.length > 0
}

const actions = {
  switchDrug ({ getters, commit, dispatch }, params) {
    if (params.drugId !== getters.getDrugId) {
      dispatch('resetAllModules')
      commit('setDrugId', params.drugId)
    }
  },
  async fetchDrugInfo ({ rootState, commit, getters }) {
    const response = await axios.get(
      `${rootState.host}/proteomicsdb/logic/drugSearchEndpoint.xsodata/InputParams(SEARCH_STR='',PROJECT_ID=-1)/Results`,
      {
        params: {
          $format: 'json',
          $select: 'DRUG_NAME,CHEMBL_ID',
          $filter: `DRUG_ID eq ${getters.getDrugId}`
        }
      }
    )

    const drugName = response.data.d.results[0].DRUG_NAME
    const chemblId = response.data.d.results[0].CHEMBL_ID

    commit('setDrugName', drugName)
    commit('setChemblId', chemblId)
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

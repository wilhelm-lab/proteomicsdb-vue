import createTabModule from '@/store/tabModuleFactory'
import axios from 'axios'

// TODO: refactor this to be reusable. Maybe there should be a more
//       standardized way to handle curve information data.
function replaceObjectKey (obj, oldKey, newKey) {
  if (oldKey !== newKey) {
    Object.defineProperty(
      obj,
      newKey,
      Object.getOwnPropertyDescriptor(obj, oldKey)
    )
    delete obj[oldKey]
  }
}

const state = {
  prefetch: true,
  menu: {
    label: 'Targets',
    showDataCount: true
  },
  routeName: 'drugTargets'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data.length : 0
}

const actions = {
  async fetchData ({ commit, dispatch, rootState }) {
    const inhibitorScopes = (await axios.get(rootState.host + '/proteomicsdb/logic/getAllInhibitorScopes.xsjs')).data

    const promiseDispatchList = inhibitorScopes.map(scope => dispatch('fetchDataForAssayType', scope))

    const allAssayTypesData = await Promise.all(promiseDispatchList)

    commit('setData', allAssayTypesData.flat())
  },

  async fetchDataForAssayType ({ rootState }, assayType) {
    const response = await axios.get(`${rootState.host}/proteomicsdb/logic/getCurveInformationByProteinID.xsjs`, {
      params: {
        protein_id: -1,
        drug_name: rootState.drug.drugName,
        assay_type: assayType,
        assay_variable: 'dose'
      }
    })

    response.data.map(obj => {
      replaceObjectKey(obj.parameter, 'bottom', 'Lower Limit')
      replaceObjectKey(obj.parameter, 'top', 'Upper Limit')
      replaceObjectKey(obj.parameter, 'slope', 'Slope')
      replaceObjectKey(obj.parameter, 'inflection', 'ED50, inflection')

      return obj
    })

    return response.data
  }
}

export default createTabModule({
  state,
  getters,
  actions
})

import createTabModule from '@/store/tabModuleFactory'

const state = {
  data: { '-1': [], 2: [] },
  prefetch: true,
  menu: {
    label: 'Meltome',
    showDataCount: true
  },
  routeName: 'proteinMeltome'
}

const getters = {
  getDataCount: (state, getters) => getters.hasData ? state.data[2].length + state.data['-1'].length : 0
}

const actions = {
  async fetchData ({ $axios, rootState, commit, dispatch }) {
    const meltingResponse = await $axios.get(rootState.host + '/proteomicsdb/logic/getCurveInformationByProteinID.xsjs', {
      params: {
        protein_id: rootState.protein.proteinId,
        drug_name: 'dmso',
        assay_type: 'PDB:101015',
        assay_variable: 'temperature'
      }
    })

    const cetsaResponse = await $axios.get(rootState.host + '/proteomicsdb/logic/getCurveInformationByProteinID.xsjs', {
      params: {
        protein_id: rootState.protein.proteinId,
        drug_name: 'not',
        assay_type: 'PDB:101015',
        assay_variable: 'temperature'
      }
    })

    const data = { 2: meltingResponse.data, '-1': cetsaResponse.data }

    commit('setData', data)
    dispatch('prepareData')
  },
  prepareData ({ getters, commit }) {
    const data = getters.getData

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

    function transformParameters (oData) {
      if (oData) {
        replaceObjectKey(oData, 'bottom', 'Lower Limit')
        replaceObjectKey(oData, 'slope', 'Slope')
        replaceObjectKey(oData, 'inflection', 'ED50, inflection')
      }
      return oData
    }

    if (data && (data['2'].length > 0 || data['-1'].length > 0)) {
      ['2', '-1'].forEach((categoryNumber) => {
        data[categoryNumber].map((obj) => {
          return obj.parameter.map((p) => {
            if (!p.formula) {
              p.formula =
                  'return Lower Limit + (Upper Limit - Lower Limit) / (1 + Math.exp(Slope * (x - ED50, inflection)));'
              transformParameters(p)
              p['Upper Limit'] = {
                name: 'Upper Limit',
                std_error: 0,
                value: 1
              }
            } else {
              p.Slope = p.slope
            }

            return p
          })
        })
      })
    }

    commit('setData', data)
  }

}

export default createTabModule({
  state,
  getters,
  actions
})

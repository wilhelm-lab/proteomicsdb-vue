import createTabModule from '@/store/tabModuleFactory'

const state = {
  prefetch: false,
  menu: {
    label: 'Feature viewer'
  },
  routeName: 'proteinFeatureViewer'
}

const getters = {
  isDisabled: (state, getters, rootState) => !rootState.protein.proteinInfo.uniprotId
}

export default createTabModule({
  getters,
  state
})

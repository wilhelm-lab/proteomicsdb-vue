const STATE_TEMPLATE = {}

const MUTATIONS_TEMPLATE = {}

const GETTERS_TEMPLATE = (modules) => ({
  getMenuItems: (state, getters) => {
    return Object.getOwnPropertyNames(modules).map((key) => {
      // If it has its own 'modules', it is nested
      if (typeof modules[key].modules !== 'undefined') {
        return {
          label: modules[key].label,
          icon: modules[key].icon,
          submodules: Object.getOwnPropertyNames(modules[key].modules).map((subkey) => getters[`${key}/${subkey}/getMenuItem`])
        }
      } else {
        return getters[key + '/getMenuItem']
      }
    })
  },
  getModuleKeyByRouteMatched (state) {
    return routeMatched => {
      const routeNames = routeMatched.map(m => m.name).reverse()
      for (const routeName of routeNames) {
        for (const key of Object.getOwnPropertyNames(modules)) {
          if (typeof modules[key].modules !== 'undefined') {
            for (const subkey of Object.getOwnPropertyNames(modules[key].modules)) {
              if (state[key][subkey].routeName === routeName) {
                return `${key}/${subkey}`
              }
            }
          } else {
            if (state[key].routeName === routeName) {
              return key
            }
          }
        }
      }
      throw new Error(`Could not find store module key for matched routes: ${routeNames.join(', ')}`)
    }
  }
})

const ACTIONS_TEMPLATE = (modules) => ({
  resetAllModules ({ dispatch }) {
    for (const key of Object.getOwnPropertyNames(modules)) {
      if (typeof modules[key].modules !== 'undefined') {
        for (const subkey of Object.getOwnPropertyNames(modules[key].modules)) {
          dispatch(`${key}/${subkey}/reset`)
        }
      } else {
        dispatch(key + '/reset')
      }
    }
  },
  async fetchAllWithPriority ({ dispatch }, priorityKey) {
    await dispatch(priorityKey + '/fetchData')
    dispatch('fetchAll')
  },
  async fetchAll ({ dispatch, getters }) {
    Object.getOwnPropertyNames(modules).forEach(key => {
      if (typeof modules[key].modules !== 'undefined') {
        Object.getOwnPropertyNames(modules[key].modules).forEach(subkey => {
          if (getters[`${key}/${subkey}/prefetch`]) {
            dispatch(`${key}/${subkey}/fetchData`)
          }
        })
      } else {
        if (getters[key + '/prefetch']) {
          dispatch(key + '/fetchData')
        }
      }
    })
  }
})

export default function createTabWrapperModule ({ state, mutations, getters, actions, modules }) {
  state = { ...STATE_TEMPLATE, ...state }
  mutations = { ...MUTATIONS_TEMPLATE, ...mutations }
  getters = { ...GETTERS_TEMPLATE(modules), ...getters }
  actions = { ...ACTIONS_TEMPLATE(modules), ...actions }

  return {
    namespaced: true,
    state,
    mutations,
    getters,
    actions,
    modules
  }
}

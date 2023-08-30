import _ from 'lodash'
import axios from 'axios'

const TAB_STATE_TEMPLATE = {
  data: [],
  prefetch: false,
  loading: true,
  cancelToken: {},
  cancelRequest: () => {},
  pendingRequest: false,
  menu: {
    label: '',
    showDataCount: false
  },
  routeName: ''
}

const TAB_MUTATIONS_TEMPLATE = {
  setData: (state, payload) => { state.data = payload },
  setCancelToken (state, payload) {
    state.cancelToken = payload
  },
  setCancelRequest (state, payload) {
    state.cancelRequest = payload
  },
  setPendingRequest (state, payload) {
    state.pendingRequest = payload
  },
  setLoading (state, payload) {
    state.loading = payload
  }
}

const TAB_GETTERS_TEMPLATE = {
  getData: state => state.data,
  getDataCount: state => state.data.length,
  getPendingRequest: state => state.pendingRequest,
  getCancelToken: state => state.cancelToken,
  getCancelRequest: state => state.cancelRequest,
  getRouteName: state => state.routeName,
  getMenuItem: (state, getters) => {
    return {
      ...state.menu,
      loading: getters.isLoading,
      dataCount: getters.getDataCount,
      routeName: getters.getRouteName,
      disabled: getters.isDisabled
    }
  },
  prefetch: state => state.prefetch,
  isLoading: state => state.prefetch && state.loading,
  isDisabled: () => false
}

const TAB_ACTIONS_TEMPLATE = {
  async fetchData (context) {},
  cancelRequest ({ getters, commit }) {
    (getters.getCancelRequest)()
    commit('setPendingRequest', false)
  },
  reset () {}
}

export default function createTabModule ({ state, mutations, getters, actions }) {
  state = { ...TAB_STATE_TEMPLATE, ...state }
  mutations = { ...TAB_MUTATIONS_TEMPLATE, ...mutations }
  getters = { ...TAB_GETTERS_TEMPLATE, ...getters }
  actions = { ...TAB_ACTIONS_TEMPLATE, ...actions }

  const fetchData = actions.fetchData
  const emptyData = _.cloneDeep(state.data)

  // inject cancel request handling
  const wrappedFetchData = async (context) => {
    if (context.getters.hasData || context.getters.getPendingRequest) {
      return
    }

    context.commit('setLoading', true)

    const cancelSource = axios.CancelToken.source()
    context.commit('setCancelToken', cancelSource.token)
    context.commit('setCancelRequest', cancelSource.cancel)
    context.commit('setPendingRequest', true)

    try {
      const $axios = axios.create({ cancelToken: cancelSource.token })
      await fetchData({ ...context, $axios })
    } catch (error) {
      if (!axios.isCancel(error)) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    } finally {
      context.commit('setPendingRequest', false)
      context.commit('setLoading', false)
    }
  }

  actions.fetchData = wrappedFetchData

  actions.reset = ({ dispatch, commit }) => {
    dispatch('cancelRequest')
    commit('setData', _.cloneDeep(emptyData))
  }
  if (!getters.hasData) {
    getters.hasData = state => {
      return !_.isEqual(state.data, emptyData)
    }
  }

  return {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
  }
}

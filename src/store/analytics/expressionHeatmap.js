import axios from 'axios'
import Vue from 'vue'
import saveAs from 'file-saver'
import { cloneDeep, isEqual } from 'lodash'

const GPROFILER_ORGANISMLIST_URL = 'https://biit.cs.ut.ee/gprofiler/api/util/organisms_list'
const GPROFILER_GGOST_URL = 'https://biit.cs.ut.ee/gprofiler/gost'
const CSV_HEADER = [
  'Entry Name',
  'Gene Name',
  'Protein Name',
  'Uniprot Identifier',
  'Tissue Name',
  'Tissue Synonym',
  'Unnormalized Intensity',
  'Maximum Normalized Intensity',
  'Minimum Normalized Intensity',
  'Avarage Normalized Intensity'
]

function getDendrogramList (
  clusterdata,
  idToIndex
) {
  return clusterdata.map(entry => ({
    isLeftDendrogram: entry[1],
    isRightDendrogram: entry[3],
    left: entry[1] ? entry[0] : idToIndex[entry[0]],
    right: entry[3] ? entry[2] : idToIndex[entry[2]],
    height: entry[4]
  }))
}

function transformHeatmapData (data) {
  const mapdata = data.mapdata
  const proteindata = data.proteindata
  const tissuedata = data.tissuedata
  const clusterdata = data.clusterdata
  const nRows = clusterdata.proteinorder.length
  const nCols = clusterdata.tissueorder.length

  let maxValue = -Infinity
  const transformedMapdata = Array.from(Array(nRows), _ => Array(nCols).fill(0))
  const transformedProteindata = Object.fromEntries(proteindata.map(p => [p[0], p]))
  const transformedTissuedata = Object.fromEntries(tissuedata.map(t => [t[0], t]))
  const proteinorderIdToIndex = Object.fromEntries(clusterdata.proteinorder.map((p, i) => [p, i]))
  const tissueorderIdToIndex = Object.fromEntries(clusterdata.tissueorder.map((t, i) => [t, i]))

  for (let i = 0; i < mapdata.length; i += 1) {
    const proteinId = mapdata[i][0]
    const tissueId = mapdata[i][1]
    const value = mapdata[i][3]

    const row = clusterdata.proteinorder.indexOf(proteinId)
    const col = clusterdata.tissueorder.indexOf(tissueId)

    transformedMapdata[row][col] = value

    if (value > maxValue) {
      maxValue = value
    }
  }

  return {
    clusterdata: {
      ...clusterdata,
      proteinorderIdToIndex,
      tissueorderIdToIndex
    },
    originalMapdata: mapdata,
    mapdata: transformedMapdata,
    proteindata: transformedProteindata,
    tissuedata: transformedTissuedata,
    maxValue
  }
}

function getDefaultState () {
  return {
    loading: false,
    selectionLoading: false,
    data: {
      clusterdata: {
        proteincluster: [],
        tissuecluster: [],
        proteinorder: [],
        tissueorder: [],
        proteinOrderIdToIndex: {},
        tissueorderIdToIndex: {}
      },
      mapdata: [[]],
      originalMapdata: [[]],
      proteindata: {},
      tissuedata: {},
      maxValue: 0
    },
    selection: {
      proteins: [''],
      omicsType: 'Proteomics',
      biologicalSources: ['tissue', 'fluid'],
      quantCalcMethod: {},
      swissprotOnly: true,
      noIsoforms: true,
      impute: false,
      source: 'db',
      datasetIds: [],
      excludeRows: [],
      excludeCols: []
    },
    selectedRowIndices: new Set(),
    selectedColIndices: new Set(),
    gProfilerOrganism: '',
    omicsTypes: [],
    quantCalcMethods: [],
    tissueColorMap: {
      tissue: 'rgb(31, 119, 180)',
      fluid: 'rgb(255, 127, 14)',
      'cell line': 'rgb(44, 160, 44)'
    },
    lastFetchedSelection: {}
  }
}

const state = getDefaultState()

const getters = {
  getSelectedProteins: state => state.selection.proteins,
  getSelectedOmicsType: state => state.selection.omicsType,
  getSelectedBiologicalSources: state => state.selection.biologicalSources,
  getSelectedQuantCalcMethod: state => state.selection.quantCalcMethod[state.selection.omicsType],
  getSelectedSwissprotOnly: state => state.selection.swissprotOnly,
  getSelectedIsoforms: state => !state.selection.noIsoforms,
  getSelectedImpute: state => state.selection.impute,
  getSelectedRowIndices: state => state.selectedRowIndices,
  getSelectedColIndices: state => state.selectedColIndices,

  getSelectionQuery: (state, getters, rootState) => {
    const { selection } = state
    const quantCalc = state.quantCalcMethods[getters.getSelectedQuantCalcMethod]

    return {
      proteins: selection.proteins.join(';'),
      omics: selection.omicsType,
      biologicalSource: selection.biologicalSources.join(';'),
      quantification: quantCalc.method,
      calculationMethod: quantCalc.unit,
      swissprotOnly: selection.swissprotOnly ? 1 : 0,
      noIsoforms: selection.noIsoforms ? 1 : 0,
      source: selection.source,
      datasetIds: selection.datasetIds.join(';'),
      impute: selection.impute ? 1 : 0,
      taxcode: rootState.organismTaxcode,
      excludeRows: getters.hasExcludedCols ? selection.excludeRows.join(';') : undefined,
      excludeCols: getters.hasExcludedRows ? selection.excludeCols.join(';') : undefined
    }
  },

  hasExcludedRows: (state) => state.selection.excludeRows.length > 0,
  hasExcludedCols: (state) => state.selection.excludeCols.length > 0,

  /**
   * @TODO maybe refactor backend to accept a comma separated list of instead since
   *       doing it using the bracket notation you hit the limit of the URL length
   *       pretty quickly. Maybe even switch to a POST request instead of GET for
   *       excluding of data.
   */
  getExcludeQueryString (state) {
    const { selection } = state

    if (selection.excludeRows.length === 0 && selection.excludeCols.length === 0) {
      return ''
    }

    let query = '?'

    if (selection.excludeRows.length > 0) {
      query += `xp[]=${selection.excludeRows.join('&xp[]=')}`
    }

    if (selection.excludeCols.length > 0) {
      if (selection.excludeRows.length > 0) {
        query += '&'
      }

      query += `xt[]=${selection.excludeCols.join('&xt[]=')}`
    }

    return query
  },

  getSelectedProteinIds: state =>
    [...state.selectedRowIndices].map(i => state.data.clusterdata.proteinorder[i]),

  getSelectedTissueIds: state =>
    [...state.selectedColIndices].map(i => state.data.clusterdata.tissueorder[i]),

  isSelectionChanged: (state, getters, rootState) =>
    !isEqual(
      state.lastFetchedSelection,
      {
        ...state.selection,
        taxcode: rootState.organismTaxcode
      }),

  hasData: state => state.data.mapdata.length > 0 && state.data.mapdata[0].length > 0,

  hasLastFetchedSelection: state =>
    state.lastFetchedSelection.proteins && state.lastFetchedSelection.proteins.length > 0,

  hasProteinsSelection: state => state.selection.proteins.length > 0 && !isEqual(state.selection.proteins, ['']),

  getColorScale: state => ({
    colors: ['#ffffff', '#b40000'],
    values: [0, state.data.maxValue]
  }),

  getRowLabels (state) {
    return state.data.clusterdata.proteinorder.map(
      (proteinId) => state.data.proteindata[proteinId][2]
    )
  },

  getColumnLabels (state) {
    return state.data.clusterdata.tissueorder.map(
      (tissueId) => state.data.tissuedata[tissueId][1]
    )
  },

  getTopDendrogram: state => getDendrogramList(
    state.data.clusterdata.tissuecluster,
    state.data.clusterdata.tissueorderIdToIndex
  ),

  getLeftDendrogram: state => getDendrogramList(
    state.data.clusterdata.proteincluster,
    state.data.clusterdata.proteinorderIdToIndex
  ),

  getTopColorAnnot (state) {
    return state.data.clusterdata.tissueorder.map(
      (tissueId) => state.tissueColorMap[state.data.tissuedata[tissueId][3]]
    )
  },

  getTopColorAnnotLabels: state =>
    Object.fromEntries(Object.entries(state.tissueColorMap).map(x => x.reverse())),

  getGProfilerUrl (state, getters) {
    const proteinIds = getters.getSelectedProteinIds.length > 0
      ? getters.getSelectedProteinIds
      : state.data.clusterdata.proteinorder

    const uniprotAccs = proteinIds.map(p => state.data.proteindata[p][3])

    const url = new URL(GPROFILER_GGOST_URL)
    url.search = new URLSearchParams({
      organism: state.gProfilerOrganism,
      query: uniprotAccs.join(' ')
    })

    return url.toString()
  }
}

const mutations = {
  resetState (state) {
    Object.assign(state, getDefaultState())
  },
  setSelectedProteins (state, proteins) {
    state.selection.proteins = proteins
  },
  setSelectedOmicsType (state, omicsType) {
    state.selection.omicsType = omicsType
  },
  setSelectedBiologicalSources (state, biologicalSources) {
    state.selection.biologicalSources = biologicalSources
  },
  setSelectedQuantCalcMethod (state, quantCalcMethod) {
    state.selection.quantCalcMethod[state.selection.omicsType] = quantCalcMethod
  },
  setSelectedSwissprotOnly (state, swissprotOnly) {
    state.selection.swissprotOnly = swissprotOnly
  },
  setSelectedIsoforms (state, isoforms) {
    state.selection.noIsoforms = !isoforms
  },
  setSelectedImpute (state, impute) {
    state.selection.impute = impute
  },
  setSelectedRowIndices (state, indices) {
    state.selectedRowIndices = indices
  },
  setSelectedColIndices (state, indices) {
    state.selectedColIndices = indices
  },
  setSelectedExcludeRows (state, excludeRows) {
    state.selection.excludeRows = excludeRows
  },
  setSelectedExcludeCols (state, excludeCols) {
    state.selection.excludeCols = excludeCols
  },
  addSelectedExcludeRowsByIndex (state, excludeRows) {
    state.selection.excludeRows = state.selection.excludeRows.concat(
      excludeRows.map(i => state.data.clusterdata.proteinorder[i])
    )
  },
  addSelectedExcludeColsByIndex (state, excludeCols) {
    state.selection.excludeCols =
      state.selection.excludeRows.concat(
        excludeCols.map(i => state.data.clusterdata.tissueorder[i])
      )
  },
  clearSelectedExcludeRows (state) {
    state.selection.excludeRows = []
  },
  clearSelectedExcludeCols (state) {
    state.selection.excludeCols = []
  }

}

const actions = {
  async fetchData ({ state, getters, commit, dispatch, rootState }) {
    state.loading = true

    if (!isEqual(state.selection.proteins, state.lastFetchedSelection.proteins)) {
      commit('clearSelectedExcludeRows')
      commit('clearSelectedExcludeCols')
    }

    dispatch('fetchGProfilerOrganism')

    const query = getters.getSelectionQuery
    const excludeQuery = getters.getExcludeQueryString

    try {
      const response = await axios.get(`${rootState.host}/logic/getExpressionProfileHeatmapCluster.xsjs${excludeQuery}`, {
        params: {
          ...query,
          excludeCols: undefined, // explicitly setting to undefined here since not recognized by backend
          excludeRows: undefined // TODO (see also `getExcludeQueryString()`) refactor backend to accept this query param
        }
      })

      state.data = transformHeatmapData(response.data)

      state.lastFetchedSelection = cloneDeep({
        ...state.selection,
        taxcode: rootState.organismTaxcode
      })
    } catch (error) {
      commit(
        'notifications/addNotification',
        {
          message: `Error while loading heatmap data: ${error.message}`,
          color: 'error'
        },
        { root: true }
      )
    } finally {
      state.loading = false
    }
  },

  async fetchOmicsTypes ({ state, commit, rootState }) {
    state.selectionLoading = true

    const response = await axios.get(`${rootState.host}/logic/getAllOmicTypesAndOrUnits.xsjs`, {
      params: {
        taxcode: rootState.organismTaxcode
      }
    })

    state.omicsTypes = response.data.map(x => x.omicTypes)
    commit('setSelectedOmicsType', state.omicsTypes[0])

    for (const omicsType of state.omicsTypes) {
      Vue.set(state.selection.quantCalcMethod, omicsType, 0)
    }

    state.selectionLoading = false
  },

  async fetchQuantificationAndCalculation ({ state, rootState }) {
    state.selectionLoading = true

    const response = await axios.get(`${rootState.host}/logic/getAllOmicTypesAndOrUnits.xsjs`, {
      params: {
        omic: state.selection.omicsType,
        taxcode: rootState.organismTaxcode
      }
    })

    state.quantCalcMethods = response.data.map(({ method, unit }) => ({ method, unit }))

    state.selectionLoading = false
  },

  async setSelectionFromQuery ({ state, commit, dispatch }, query) {
    const {
      omics,
      proteins,
      biologicalSource,
      quantification,
      calculationMethod,
      swissprotOnly,
      noIsoforms,
      impute,
      excludeRows,
      excludeCols
    } = query

    await dispatch('fetchOmicsTypes')
    omics && commit('setSelectedOmicsType', omics)

    await dispatch('fetchQuantificationAndCalculation')
    if (quantification && calculationMethod) {
      commit('setSelectedQuantCalcMethod', state.quantCalcMethods.findIndex(
        q => q.method === quantification && q.unit === calculationMethod
      ))
    }

    proteins && commit('setSelectedProteins', proteins.split(';'))
    biologicalSource && commit('setSelectedBiologicalSources', biologicalSource.split(';'))
    swissprotOnly !== undefined && commit('setSelectedSwissprotOnly', swissprotOnly === '1')
    noIsoforms !== undefined && commit('setSelectedIsoforms', noIsoforms !== '1')
    impute !== undefined && commit('setSelectedImpute', impute === '1')
    excludeRows !== undefined && excludeRows.length > 0 && commit('setSelectedExcludeRows', excludeRows.split(';'))
    excludeCols !== undefined && excludeCols.length > 0 && commit('setSelectedExcludeCols', excludeCols.split(';'))
  },

  async fetchGProfilerOrganism ({ state, commit, rootState }) {
    if (rootState.organismTaxcode !== state.lastFetchedSelection.taxcode ||
      !state.gProfilerOrganism) {
      const response = await axios.get(GPROFILER_ORGANISMLIST_URL)
      const selectedOrganism = response.data.find(
        x => parseInt(x.taxonomy_id) === parseInt(rootState.organismTaxcode)
      )
      state.gProfilerOrganism = selectedOrganism.id
    }
  },

  downloadCsv ({ state }) {
    const rows = [CSV_HEADER]
    const { proteindata, tissuedata } = state.data

    for (const proteinId of state.data.clusterdata.proteinorder) {
      for (const tissueId of state.data.clusterdata.tissueorder) {
        const mapdataRow = state.data.originalMapdata.find(
          x => x[0] === proteinId && x[1] === tissueId
        )

        if (mapdataRow) {
          const row = [
            proteindata[proteinId][4],
            proteindata[proteinId][2],
            proteindata[proteinId][1],
            proteindata[proteinId][3],
            tissuedata[tissueId][1],
            tissuedata[tissueId][2],
            mapdataRow[2],
            mapdataRow[5],
            mapdataRow[4],
            mapdataRow[3]
          ]

          rows.push(row)
        }
      }
    }

    const csv = rows.map(row => row.join(';')).join('\n')

    saveAs(new Blob([csv], { type: 'text/plain;charset=utf-8' }), 'ExpressionHeatmap.csv')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

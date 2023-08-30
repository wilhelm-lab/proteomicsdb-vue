import axios from 'axios'
import parser from 'fast-xml-parser'
import { transformStandard, transformScatterPlot, transformPure, transformHeatmap, transformRadar, transformBoxplot, transformBubbleChart } from '../utils/dataExplorer/dataTransformation'
import { processParameter, processConditions, unifyLength } from '../utils/dataExplorer/parameterTransformation'

const baseUrlProcedures = 'http://d32.proteomicsdb.in.tum.de/proteomicsdb/logic'

const storeState = {
  loading: true,
  xAxisData: ['M1', 'M2', 'M3', 'M4'],
  yAxisData: [5, 10, 3, 8],
  zAxis: [],
  zTransformations: [],
  zAggregations: [],
  colors: ['#aaaaaa'],
  formValues: {
    tableName: '',
    xAxis: '',
    yAxis: '',
    z1Axis: '',
    z2Axis: '',
    xTransformation: '',
    yTransformation: '',
    z1Transformation: '',
    z2Transformation: '',
    xAggregation: '',
    yAggregation: '',
    z1Aggregation: '',
    z2Aggregation: '',
    groupByMain: [],
    groupByAdditional: [],
    conditions: [],
    selectedChart: 0,
    submitted: false
  },
  metadata: [],
  results: [],
  // this makes sense when we return an empty array due to trying to retrieve too many entries, we return the size
  resultsSize: 0,
  responseStatus: ''
}
const mutations = {
  setLoading (state, loading) {
    state.loading = loading
  },
  setXAxisData (state, xAxisData) {
    state.xAxisData = xAxisData
  },
  setYAxisData (state, yAxisData) {
    state.yAxisData = yAxisData
  },
  setZAxis (state, zAxis) {
    state.zAxis = zAxis
  },
  setZTransformations (state, zTransformations) {
    state.zTransformations = zTransformations
  },
  setZAggregations (state, zAggregations) {
    state.zAggregations = zAggregations
  },
  setFormValues (state, formValues) {
    state.formValues = formValues
  },
  setColors (state, colors) {
    state.colors = colors
  },
  setMetadata (state, metadata) {
    state.metadata = metadata
  },
  setResults (state, results) {
    state.results = results
  },
  setResultsSize (state, resultsSize) {
    state.resultsSize = resultsSize
  },
  setResponseStatus (state, responseStatus) {
    state.responseStatus = responseStatus
  }
}
const getters = {}

const actions = {
  getAnalyticsData: ({ commit, state }, { groupByColumnsFinalized, limitSize }) => {
    if (state.formValues.xAxis === '' || state.formValues.yAxis === '' || state.formValues.tableName === '') return
    const xAxis = state.formValues.xAxis.Name
    const yAxis = state.formValues.yAxis.Name
    const zAxis = state.zAxis
    const zTransformations = state.zTransformations
    const zAggregations = state.zAggregations
    // either add or do not add the param based on whether the value exists or not
    const xTransformationParam =
            state.formValues.xTransformation !== '' ? '&x_transformation=' : ''
    const yTransformationParam =
            state.formValues.yTransformation !== '' ? '&y_transformation=' : ''
    const xAggregationParam =
            state.formValues.xAggregation !== '' ? '&x_aggregation=' : ''
    const yAggregationParam =
            state.formValues.yAggregation !== '' ? '&y_aggregation=' : ''
    const zAxisParam = zAxis.length > 0 ? '&z_axis=' : ''
    const zTransformationParam = zTransformations.length > 0 ? '&z_transformation=' : ''
    const zAggregationParam = zAggregations.length > 0 ? '&z_aggregation=' : ''
    const groupByColumnsParam =
            groupByColumnsFinalized.length > 0 ? '&group_by_columns=' : ''
    const conditionsParam =
            state.formValues.conditions.length > 0 ? '&conditions=' : ''
    const limitSizeParam = limitSize > 0 ? '&limit_size=' : ''
    const limitSizeValue = limitSize > 0 ? limitSize : ''

    // prepare form data for the request

    const processedZAxis = zAxis.length > 0 ? processParameter(zAxis.map(entry => entry.Name)) : ''
    const modifiedZTransformations = unifyLength(zAxis, zTransformations)
    const modifiedZAggregations = unifyLength(zAxis, zAggregations)
    const processedZTransformations = processParameter(modifiedZTransformations)
    const processedZAggregations = processParameter(modifiedZAggregations)
    const processedConditions = processConditions(state.formValues.conditions)
    return axios.get(`${baseUrlProcedures}/getDataExplorerData.xsjs?table_name=${state.formValues.tableName}&x_axis=${xAxis}&y_axis=${yAxis}${zAxisParam}${processedZAxis}${xTransformationParam}${state.formValues.xTransformation}${yTransformationParam}${state.formValues.yTransformation}${zTransformationParam}${processedZTransformations}${xAggregationParam}${state.formValues.xAggregation}${yAggregationParam}${state.formValues.yAggregation}${zAggregationParam}${processedZAggregations}${groupByColumnsParam}${groupByColumnsFinalized.join(';')}${conditionsParam}${processedConditions}${limitSizeParam}${limitSizeValue}`)
      .then((response) => {
        const data = response.data
        console.log('initial data', data)
        commit('setResults', data.results)
        commit('setResultsSize', data.size)
        commit('setColors', ['#99ccff'])
        commit('setResponseStatus', response.status)
        return Promise.resolve(response.data)
      })
      .catch((error) => {
        const errorCode = error.message === 'Request failed with status code 500' ? 500 : 400
        commit('setResponseStatus', errorCode)
        return Promise.resolve({})
      })
      .finally(() => {
        commit('setLoading', false)
      })
  },
  getMetadata: ({ commit }) => {
    const xml2JSONOptions = {
      attributeNamePrefix: '',
      textNodeName: '#text',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      cdataTagName: '__cdata', // default is 'false'
      cdataPositionChar: '\\c',
      parseTrueNumberOnly: false,
      numParseOptions: {
        hex: true,
        leadingZeros: true
        // skipLike: /\+[0-9]{10}/
      }
    }
    axios.get(`${baseUrlProcedures}/api_v2/self_service_bi.xsodata/$metadata`)
      .then((response) => {
        const jsonResponse = parser.parse(response.data, xml2JSONOptions)[
          'edmx:Edmx'
        ]['edmx:DataServices'].Schema.EntityType
        commit('setMetadata', jsonResponse)
      })
      .catch(e => {
        console.log(e)
      })
  },
  processResults: ({ commit, state }, { results }) => {
    if (typeof results === 'undefined' || results.length === 0) return
    if (state.formValues.selectedChart === 'Scatter') {
      const processedArr = transformScatterPlot(results)
      commit('setXAxisData', processedArr)
    } else if (state.formValues.selectedChart === 'Treemap') {
      commit('setXAxisData', transformPure(results))
    } else if (state.formValues.selectedChart === 'Heatmap') {
      commit('setXAxisData', transformHeatmap(results))
    } else if (state.formValues.selectedChart === 'Radar') {
      const radarTransformation = transformRadar(results)
      const xAxisData = radarTransformation[0]
      const yAxisData = radarTransformation[1]
      commit('setXAxisData', xAxisData)
      commit('setYAxisData', yAxisData)
    } else if (state.formValues.selectedChart === 'Boxplot') {
      const boxplotTransformation = transformBoxplot(results)
      commit('setXAxisData', boxplotTransformation)
    } else if (state.formValues.selectedChart === 'Bubble') {
      const bubbleChartTransformation = transformBubbleChart(results)
      commit('setXAxisData', bubbleChartTransformation)
    } else {
      const xAxis = state.formValues.xAxis.Name
      const yAxis = state.formValues.yAxis.Name
      const standardTransformation = transformStandard(results, xAxis, yAxis)
      const xAxisData = standardTransformation[0]
      const yAxisData = standardTransformation[1]
      commit('setXAxisData', xAxisData)
      commit('setYAxisData', yAxisData)
    }
  },
  clearState ({ commit }) {
    commit('setXAxisData', ['M1', 'M2', 'M3', 'M4'])
    commit('setYAxisData', [5, 10, 3, 8])
    commit('setZAxis', [])
    commit('setZTransformations', [])
    commit('setZAggregations', [])
    commit('setLoading', true)
    commit('setFormValues', {
      tableName: '',
      xAxis: '',
      yAxis: '',
      z1Axis: '',
      z2Axis: '',
      xTransformation: '',
      yTransformation: '',
      z1Transformation: '',
      z2Transformation: '',
      xAggregation: '',
      yAggregation: '',
      z1Aggregation: '',
      z2Aggregation: '',
      groupByMain: [],
      groupByAdditional: [],
      conditions: [],
      selectedChart: 0,
      submitted: false
    })
    commit('setColors', ['#aaaaaa'])
    commit('setResultsSize', 0)
    commit('setResponseStatus', '')
  }
}

export default {
  namespaced: true,
  state: storeState,
  mutations,
  getters,
  actions
}

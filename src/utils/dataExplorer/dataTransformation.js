import { processBoxplotData } from './boxplotCalculation'

export const transformScatterPlot = (results) => {
  return results.map((entry) => Object.values(entry))
}

// just two arrays containing basic values
export const transformStandard = (results, xAxis, yAxis) => {
  const xAxisData = results.map(
    (entry) => entry[xAxis]
  )
  const yAxisData = results.map(
    (entry) => entry[yAxis]
  )

  return [xAxisData, yAxisData]
}

// [{a: 't', x: 2, y: 3, z:5}, {a: 't', x: 3, y: 4, z:5}, {a: 'y', x: 3, y: 4, z:5}] => [{name: 't', data: [[2,3,5], [3,4,5]]}]
export const transformBubbleChart = (results) => {
  const arrayOfValues = results.map(entry => ({ name: entry[Object.keys(entry)[0]], data: Object.values(entry).slice(1) })) // [{name: 't', data: [2,3,5], {name: 't', data: [3,4,5]}]
  const map = new Map(arrayOfValues.map((entry) => [entry.name, { name: entry.name.toString(), data: [] }]))
  for (const { name, data } of arrayOfValues) {
    map.get(name).data.push(...[data])
  }
  return [...map.values()]
}

const prepareBoxplotData = results => {
  const arrayOfValues = results.map(entry => ({ name: entry[Object.keys(entry)[0]], data: Object.values(entry).slice(1) })) // [{name: 't', data: [2,3,5], {name: 't', data: [3,4,5]}]
  const map = new Map(arrayOfValues.map((entry) => [entry.name, { name: entry.name, data: [] }]))
  for (const { name, data } of arrayOfValues) {
    map.get(name).data.push(...data)
  }
  return [...map.values()]
}

// [{x: 't', y: 3}, {x: 't', y: 4}, {x: 'p', y: 5}] => [{x: 't', y: [3, 4]}]
// WE NEED ONLY AN X- AND Y-axis where our y-axis is the data from which we derive the quantiles, mean etc.
// Object.keys(entry)[0] is the value of the first object key - our xAxis
export const transformBoxplot = (results) => {
  // const resultingArray = results.map(entry => ({ x: entry[Object.keys(entry)[0]], y: Object.values(entry).slice(1) }))
  const resultingArray = prepareBoxplotData(results)
  const processedResultingArray = resultingArray.map(entry => ({ x: entry.name.toString(), y: processBoxplotData(entry.data) }))
  return processedResultingArray
}

// [{PROP1: 1, PROP2: 2}] => [{x: 1, y: 2}]
export const transformPure = (results) => {
  const resultingArray = results.map(entry => ({ x: Object.values(entry)[0], y: Object.values(entry)[1] }))
  return resultingArray
}

// [{prop1: 1, prop2: 2, prop3: 3}, {prop1: 1, prop2: 2, prop3: 4}, {prop1: 2, prop2: 3, prop3: 7}] => [{name: 2, data: [3, 7]}, {name: 3, data: [7]}]
export const transformRadar = (results) => {
  // only xAxis values unique
  const xAxisData = [...new Set(results.map(entry => Object.values(entry)[0]))]
  const arrayOfValues = results.map(entry => ({ name: entry[Object.keys(entry)[1]], data: Object.values(entry).slice(2) })) // [{name: 't', data: [2,3,5], {name: 't', data: [3,4,5]}]
  const map = new Map(arrayOfValues.map((entry) => [entry.name, { name: entry.name.toString(), data: [] }])) // [{name: 't', data: [2,3,5,3,4,5]}]
  for (const { name, data } of arrayOfValues) {
    map.get(name).data.push(...data)
  }
  return [xAxisData, [...map.values()]]
}

// [{prop1: 1, prop2: 2}, {prop1: 1, prop2: 2}, {prop1: 2, prop2: 3}] => [{name: 1, data: [2, 2]}, {name: 2, data: [3]}]
export const transformHeatmap = (results) => {
  const arrayOfValues = results.map(entry => ({ name: entry[Object.keys(entry)[0]], data: Object.values(entry).slice(1) })) // [{name: 't', data: [2,3,5], {name: 't', data: [3,4,5]}]
  const map = new Map(arrayOfValues.map((entry) => [entry.name, { name: entry.name, data: [] }])) // [{name: 't', data: [2,3,5,3,4,5]}]
  for (const { name, data } of arrayOfValues) {
    map.get(name).data.push(...data)
  }
  return [...map.values()]
}

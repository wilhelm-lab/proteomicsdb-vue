const sortArrayAsc = arr => arr.sort((a, b) => a - b)

// https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
const calculateQuantile = (arr, q) => {
  const sorted = sortArrayAsc(arr)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base])
  } else {
    return sorted[base]
  }
}

const calculateLowerQuantile = arr => calculateQuantile(arr, 0.25)

const calculateMedian = arr => calculateQuantile(arr, 0.50)

const calculateUpperQuantile = arr => calculateQuantile(arr, 0.75)

export const processBoxplotData = (data) => {
  const sortedData = sortArrayAsc(data)
  const minimum = sortedData[0]
  const maximum = sortedData[sortedData.length - 1]
  const lowerQuantile = calculateLowerQuantile(sortedData)
  const median = calculateMedian(sortedData)
  const upperQuantile = calculateUpperQuantile(sortedData)

  return [minimum, lowerQuantile, median, upperQuantile, maximum]
}

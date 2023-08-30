const operators = new Map([
  ['<', 'lt'],
  ['<=', 'lte'],
  ['=', 'eq'],
  ['>=', 'gte'],
  ['>', 'gt']
])

// This function is used to make sure that the zAxis, zTransformations and zAggregations arrays are of the same length
// arrOne is the zAxis array and arrTwo is the zTransformations or zAggregations array
export const unifyLength = (arrOne, arrTwo) => {
  const arrOneLength = arrOne.length
  const arrTwoLength = arrTwo.length

  if (arrOneLength <= arrTwoLength) {
    return arrTwo
  }
  const modifiedArrTwo = arrTwo
  // example: arrOne has length 4 whereas arrtwo has length 2
  for (let i = arrOneLength - arrTwoLength; i < arrOne.length; i++) {
    modifiedArrTwo.push('')
  }
  return modifiedArrTwo
}

export const processParameter = (parameter) => {
  if (parameter.length > 0) {
    return parameter.join(';')
  }
  return ''
}

export const processConditions = (conditions) => {
  if (conditions.length > 0) {
    return conditions.map(({ column, transformation, operator, value }) => `${column.Name},${transformation},${operators.get(operator)},${value}`).join(';')
  }
  return ''
}

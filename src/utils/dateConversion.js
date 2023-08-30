function dateFromEdmString (edmDate) {
  const content = edmDate.match(/(\d+)([+-])?(\d+)?/)
  let ticks = Number(content[1])
  const operator = content[2]
  const offset = Number(content[3]) * 60000

  if (operator === '+' && offset) {
    ticks += offset
  } else if (operator === '-' && offset) {
    ticks -= offset
  }
  return new Date(ticks)
}

export default dateFromEdmString

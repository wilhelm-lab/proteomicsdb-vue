export const checkIsValidField = (field) => {
  if (field === '' || typeof field === 'undefined') return false
  return true
}

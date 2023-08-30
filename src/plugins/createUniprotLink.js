export function createUniProtLink (accId) {
  return accId.includes('-')
    ? 'https://www.uniprot.org/uniprot/' + accId.split('-')[0] + '#' + accId
    : 'https://www.uniprot.org/uniprot/' + accId
}

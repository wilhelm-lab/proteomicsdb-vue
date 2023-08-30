import axios from 'axios'

export async function fetchProteinIdForUniprotId (host, uniprotId) {
  const response = await axios.get(
      `${host}/proteomicsdb/logic/api_v2/api.xsodata/Protein`,
      {
        params: {
          $format: 'json',
          $filter: `UNIQUE_IDENTIFIER eq '${uniprotId}' and DECOY eq 0`
        }
      }
  )

  return response.data.d.results[0].PROTEIN_ID
}

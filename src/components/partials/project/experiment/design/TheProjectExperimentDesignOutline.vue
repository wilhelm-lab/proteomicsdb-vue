<template>
  <v-simple-table>
    <template #default>
      <thead>
        <tr>
          <th class="text-left">
            Control
          </th>
          <th class="text-left">
            Parameters
          </th>
          <th
            v-for="i in numTreatmentsHelper"
            :key="`treatment-${i}`"
            class="text-left"
          />
          <th
            v-for="i in numBioreplicatsHelper"
            :key="`bioRep-${i}`"
            class="text-left"
          >
            Bio replicate {{ i + 1 }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="condition in conditions"
          :key="condition.id"
        >
          <td>
            <v-checkbox
              v-model="condition.control"
              disabled
            />
          </td>
          <td
            v-for="(treatment, i) in [...condition.treatments]"
            :key="`treatment-${i}`"
          >
            <template v-for="parameter in getTreatmentParameters(treatment)">
              <v-chip
                v-if="parameter.value !== null"
                :key="parameter.id"
                class="ma-1"
              >
                {{ parameter.value }}
                <template v-if="unitMap[parameter.unitId]">
                  {{ unitMap[parameter.unitId] }}
                </template>
              </v-chip>
            </template>
          </td>
          <td
            v-for="replicate in [...condition.bioRep]"
            :key="`bioRep-${replicate.bioRep}`"
          >
            <v-chip
              v-for="sample in [...replicate.samples]"
              :key="sample.id"
            >
              <router-link :to="getSampleRoute(sample.id)">
                {{ sample.name }}
              </router-link>
            </v-chip>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import axios from 'axios'
import range from 'lodash/range'

export default {
  props: {
    experimentDesign: {
      // TODO: refactor backend...
      type: Object,
      required: true
    },
    projectId: {
      type: String,
      required: true
    },
    experimentId: {
      type: String,
      required: true
    }
  },
  data: () => ({
    unitMap: {}
  }),
  computed: {
    /** @returns {any[]} */
    conditions () {
      if (this.experimentDesign.conditions) {
        return this.experimentDesign.conditions.slice().sort((a, b) => a.order - b.order) || []
      } else {
        return []
      }
    },
    /** @returns {number[]} */
    numTreatmentsHelper () {
      if (this.conditions.length > 0) {
        return range(Math.max(...this.conditions.map(condition => condition.treatments.length)) - 1)
      } else {
        return []
      }
    },
    /** @returns {number[]} */
    numBioreplicatsHelper () {
      if (this.conditions.length > 0) {
        return range(Math.max(...this.conditions.map(condition => condition.bioRep.length)))
      } else {
        return []
      }
    }
  },
  watch: {
    experimentDesign () {
      if (this.conditions.length > 0) {
        this.conditions.forEach(condition => {
          condition.treatments.forEach(treatment => {
            Object.values(treatment).forEach(dimension => {
              this.fetchUnitName(dimension.unitId)
            })
          })
        })
      }
    }
  },
  methods: {
    async fetchUnitName (unitId) {
      if (unitId === '') {
        return
      }

      if (!(unitId in this.unitMap)) {
        this.$set(this.unitMap, unitId, unitId)

        // needs to be double encoded. See https://www.ebi.ac.uk/ols/docs/api#resources-term
        const termUri = encodeURIComponent(encodeURIComponent(`http://purl.obolibrary.org/obo/${unitId.replace(':', '_')}`))

        const response = await axios.get(
          `https://www.ebi.ac.uk/ols/api/ontologies/uo/terms/${termUri}`
        )

        // this.unitMap[unitId] = response.data.label
        this.$set(this.unitMap, unitId, response.data.label)
      }
    },
    /** @returns {any[]} */
    getTreatmentParameters (treatment) {
      return Object.values(treatment)
    },
    getSampleRoute (sampleId) {
      return {
        name: 'projectExperimentSample',
        params: {
          projectId: this.projectId,
          experimentId: this.experimentId,
          sampleId
        }
      }
    }
  }
}
</script>

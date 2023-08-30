<template>
  <v-card elevation="0">
    <v-card-title>
      <h2 class="text-h5">
        Sequence Coverage
      </h2>
    </v-card-title>
    <v-card-text>
      <v-simple-table>
        <tbody>
          <tr
            v-for="item in statistics"
            :key="item.name"
          >
            <td>
              {{ item.name }}
            </td>
            <td>
              {{ item.value }}
            </td>
          </tr>
        </tbody>
      </v-simple-table>
      <div class="pa-3">
        <h3 class="text-h6 mb-2 ">
          Sequence:
        </h3>
        <div class="sequence-coverage-legend mb-3">
          <span class="sequence-coverage-segment-part--cov mr-3 font-italic">Covered</span><br>
          <span class="sequence-coverage-segment-part--nocov font-italic">Not covered</span>
        </div>
        <div class="sequence-coverage">
          <div
            v-for="(row, rowIndex) in sequenceParts"
            :key="rowIndex"
            class="sequence-coverage__row"
          >
            <span
              v-for="(segment, segmentIndex) in row"
              :key="segmentIndex"
              class="sequence-coverage-segment"
            >
              <span
                v-for="(segmentPart, segmentPartIndex) in segment"
                :key="segmentPartIndex"
                :class="`sequence-coverage-segment-part--${segmentPart.type}`"
              >{{ segmentPart.value }}</span>
            </span>

            <span
              v-if="(rowIndex + 1) * charsPerRow < sequence.length"
              class="sequence-coverage-charnumber"
            >{{ (rowIndex + 1) * charsPerRow }}</span>

            <span
              v-else
              class="sequence-coverage-charnumber"
            >{{ sequence.length }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SequenceCoverage',
  props: {
    proteinId: {
      type: String,
      default: ''
    },
    charsPerSegment: {
      type: Number,
      default: 10
    },
    charsPerRow: {
      type: Number,
      default: 40
    }
  },
  data: () => ({
    length: 0,
    mass: '',
    coverage: '',
    sequence: ''
  }),
  computed: {
    /** @returns {{name: string, value: any}[]} */
    statistics () {
      return [
        { name: 'Length', value: this.length },
        { name: 'Mass', value: this.mass },
        { name: 'Sequence Coverage', value: this.coverage }
      ]
    },
    /** @returns {{type: string, value: string}[][][]} */
    sequenceParts () {
      if (!this.sequence) {
        return []
      }

      const parts = this.sequence.match(new RegExp('.{1,' + this.charsPerRow + '}', 'g'))
        .map(row => row.match(new RegExp('.{1,' + this.charsPerSegment + '}', 'g')))
        .map(row => row.map(segment => segment.split(/([A-Z]+|[a-z]+)/)))
        .map(row => row.map(segment => segment.filter(segmentPart => segmentPart !== '')))
        .map(row => row.map(segment => segment.map(segmentPart => {
          return segmentPart.match(/[A-Z]+/)
            ? { type: 'cov', value: segmentPart }
            : { type: 'nocov', value: segmentPart.toUpperCase() }
        })))

      return parts
    }
  },
  watch: {
    proteinId () {
      this.fetchData()
    }
  },
  created () {
    if (this.proteinId) {
      this.fetchData()
    }
  },
  methods: {
    async fetchData () {
      const response = await axios.get(this.$store.state.host + '/proteomicsdb/logic/getProteinSequenceCoverageByProtein.xsjs', {
        params: {
          protein_id: this.proteinId
        }
      })

      this.length = response.data.LENGTH
      this.mass = response.data.MASS
      this.coverage = response.data.SEQUENCE_COVERAGE
      this.sequence = response.data.SEQUENCE
    }
  }
}
</script>

<style scoped lang="scss">
.sequence-coverage {
  font-family: monospace;
  padding: 1em;
  background: #f5f5f5;
  max-height: 50vh;
  overflow: auto;
  overflow-x: auto;
  white-space: nowrap;
}

.sequence-coverage-segment {
  margin-right: 1em;
}

.sequence-coverage-segment-part--cov {
  color: rgb(89, 188, 69);
}

.sequence-coverage-segment-part--nocov {
  color: rgb(0, 0, 0);
}
</style>

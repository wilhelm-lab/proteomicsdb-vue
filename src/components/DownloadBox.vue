<template>
  <v-flex>
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-btn
          small
          v-bind="attrs"
          :disabled="disableCSVButton"
          v-on="on"
          @click="clickCSV"
        >
          <v-icon small>
            mdi-download
          </v-icon>
          CSV
        </v-btn>
      </template>
      <span>Download the raw data as CSV</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-btn
          small
          v-bind="attrs"
          :disabled="disablePlotButton"
          v-on="on"
          @click="clickPNG"
        >
          <v-icon small>
            mdi-download
          </v-icon>
          PNG
        </v-btn>
      </template>
      <span>Download the image(s) as a PNG file</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-btn
          small
          v-bind="attrs"
          :disabled="disablePlotButton"
          v-on="on"
          @click="clickSVG"
        >
          <v-icon small>
            mdi-download
          </v-icon>
          SVG
        </v-btn>
      </template>
      <span>Download the image(s) as a SVG file</span>
    </v-tooltip>
    <canvas
      :id="canvasId"
      style="display:none"
    />
  </v-flex>
</template>

<script>
export default {
  props: {
    disableCSVButton: {
      type: Boolean,
      default: false
    },
    disablePlotButton: {
      type: Boolean,
      default: false
    },
    canvasId: {
      type: String,
      default: 'myCanvas'
    }
  },
  methods: {
    clickCSV: function () {
      this.$emit('download-csv')
    },
    clickPNG: function () {
      this.$emit('download-plot', this.canvasId, false)
    },
    clickSVG: function () {
      this.$emit('download-plot', this.canvasId, true)
    }
  }
}

</script>

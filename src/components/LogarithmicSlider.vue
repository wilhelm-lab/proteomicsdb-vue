<template>
  <div
    class="logarithmic-slider"
    style="display: inline"
  >
    <div style="float:left">
      <label
        v-if="title"
        for="slider"
        style="display:block;font-size: 12px"
      >{{ title }}</label>
      <label
        v-if="showLabels"
      > {{ minValue }} </label>
      <input
        id="slider"
        v-model="sliderValue"
        type="range"
        :min="minPosition"
        :max="maxPosition"
        :style="'width:' + width + 'px'"
      >
      <label
        v-if="showLabels"
      > {{ maxValue }} </label>
    </div>

    <v-text-field
      :value="value.toFixed(0)"
      class="px-3 py-2 vuetify-text-field"
      hide-details
      single-line
      outlined
      dense
      style="max-width: 150px;"
      type="number"
      @input="updateSliderValue"
    />
  </div>
</template>

<script>
export default {
  name: 'LogarithmicSlider',
  props: {
    minPosition: {
      type: Number,
      default: 0
    },
    maxPosition: {
      type: Number,
      default: 1000
    },
    minValue: {
      type: Number,
      default: 0
    },
    maxValue: {
      type: Number,
      default: 1000
    },
    value: {
      type: Number,
      default: 0
    },
    showLabels: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: null
    },
    width: {
      type: Number,
      default: 175
    }
  },
  data: () => ({
    sliderValue: 0
  }),
  computed: {
    /** @returns {number} */
    scale () {
      return (Math.log(this.maxValue) - Math.log(this.minValue)) / (this.maxPosition - this.minPosition)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (newValue) {
        this.updateSliderValue(newValue)
      }
    },
    sliderValue: {
      immediate: false,
      handler () {
        this.$emit('updateValue', Math.exp(Math.log(this.minValue) + this.scale * (this.sliderValue - this.minPosition)))
      }
    }
  },
  methods: {
    updateSliderValue (val) {
      // Reverse the logarithmicSliderValue function, apply it to the entered value and set the slider value to that
      this.sliderValue = ((Math.log(val) - Math.log(this.minValue)) / this.scale) + this.minPosition
    }
  }
}
</script>

<style scoped>
.vuetify-text-field {
  margin: 0 -50px;
}
</style>

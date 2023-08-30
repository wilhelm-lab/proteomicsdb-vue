<template>
  <div>
    <v-btn
      v-if="keywords.length > 3"
      small
      :disabled="disabled"
      elevation="0"
      class="mb-3"
      @click="appendKeywordInput"
    >
      <v-icon
        left
        dark
      >
        mdi-cancel
      </v-icon>
      Clear all
    </v-btn>
    <v-text-field
      v-for="(input, idx) in keywords"
      :key="idx"
      ref="inputs"
      v-model="keywords[idx]"
      :disabled="disabled"
      outlined
      dense
      :label="label"
      hide-details="auto"
      class="mb-2"
      append-icon="mdi-close-circle"
      @click:append="removeKeywordInput(idx)"
      @keypress.enter="appendKeywordInput()"
    />
    <v-row class="pa-3">
      <v-btn
        small
        :disabled="disabled"
        elevation="0"
        @click="appendKeywordInput"
      >
        <v-icon
          left
          dark
        >
          mdi-plus
        </v-icon>
        Add field
      </v-btn>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => ['']
    },
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Protein ID or search term'
    }
  },
  data () {
    return {
      keywords: this.value
    }
  },
  watch: {
    value () {
      this.keywords = this.value
    }
  },
  methods: {
    handleInput () {
      this.$emit('input', this.keywords)
    },
    appendKeywordInput () {
      this.keywords.push('')
      this.$nextTick(
        () => this.$refs.inputs[this.$refs.inputs.length - 1].focus()
      )
    },
    removeKeywordInput (idx) {
      this.$delete(this.keywords, idx)
    }
  }

}
</script>

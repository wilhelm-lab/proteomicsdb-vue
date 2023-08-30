<template>
  <v-tooltip left>
    <template #activator="{ on, attrs }">
      <v-btn
        :disabled="disabled"
        color="primary"
        fab
        :loading="loading"
        v-bind="attrs"
        @click="toggleColumnChooser"
        v-on="on"
      >
        <v-icon>
          mdi mdi-format-align-justify mdi-rotate-90
        </v-icon>
      </v-btn>
    </template>
    <span>Show/hide columns</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    raiseEvent: function (message) {
      this.$emit(message, null)
    },
    toggleColumnChooser () {
      this.raiseEvent('toggle-column-chooser')
    }
  }
}
</script>

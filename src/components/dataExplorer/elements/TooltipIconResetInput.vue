<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        icon
        color="orange"
        class="mt-2"
        v-on="on"
        @click="resetValue"
      >
        <v-icon dense>
          mdi-close-circle
        </v-icon>
      </v-btn>
    </template>
    <span>Reset value</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'TooltipIconResetInput',
  components: {},
  props: {
    input: {
      type: String,
      default () {
        return ''
      }
    }
  },
  methods: {
    resetValue () {
      this.$emit('reset-value', this.input)
    }
  }
}
</script>

<style scoped>
</style>

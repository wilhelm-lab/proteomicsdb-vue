<template>
  <v-snackbar
    v-model="showSnackbar"
    multi-line
    :timeout="timeout"
  >
    Idea Submission successful.
    You will be redirected to the community screen by clicking OK.
    <template #action="{ attrs }">
      <v-btn
        v-bind="attrs"
        :to="{name: 'community'}"
      >
        Ok
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'IdeaSubmissionSnackbar',
  props: {
    submissionValid: {
      type: Boolean,
      default: null
    }
  },
  data: () => ({
    timeout: -1,
    showSnackbar: false
  }),
  watch: {
    submissionValid (val) {
      this.showSnackbar = val
    }
  }
}
</script>

<style scoped>

</style>

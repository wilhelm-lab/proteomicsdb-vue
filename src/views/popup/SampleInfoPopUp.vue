<template>
  <v-dialog
    v-model="dialogModel"
    max-width="800"
    @keydown.esc="close"
    @click:outside="close"
  >
    <v-card>
      <v-btn
        icon
        @click="close"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <TheProjectExperimentSampleInfo
        :sample-id="sampleId"
        :omics="omics"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import TheProjectExperimentSampleInfo from '../../components/partials/project/experiment/sample/TheProjectExperimentSampleInfo'

export default {
  components: {
    TheProjectExperimentSampleInfo
  },
  props: {
    openDialog: {
      type: Boolean,
      default: false
    },
    sampleId: {
      type: String,
      default: ''
    },
    omics: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    dialogModel: false
  }),
  watch: {
    openDialog: function () {
      this.dialogModel = this.openDialog
    }
  },
  mounted () {
    this.dialogModel = this.openDialog
  },
  methods: {
    close: function () {
      this.dialogModel = false
      this.$emit('closePopUp', null)
    }
  }
}
</script>
<style lang="scss">
</style>

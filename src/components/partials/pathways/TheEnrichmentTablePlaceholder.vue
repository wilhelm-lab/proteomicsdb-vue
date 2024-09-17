<template>
  <v-card flat>
    <v-card-text class=" d-flex justify-center align-center">
      <v-alert
        color="blue-grey"
        text
        icon="mdi-exclamation"
        class="mt-8 pa-8"
        prominent
      >
        <div style="padding-left: 8px; margin-bottom: 1em">
          This table is not available!<br>
          Did you upload this dataset only just now?<br>
          Then the enrichment analysis is probably still running.<br>
          If it still is not here after a few minutes, something probably went wrong.<br>
          Please contract a site administrator.<br><br>
          Please note that for non-Phosphoproteomic datasets,<br>only 'PEA Gene-Centric' and 'PEA Gene-Centric Redundant'
          can be performed.<br>
          If you uploaded phospho-sites instead of phospho-peptides,<br>all algorithms can be performed except for K-STAR.
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'TheEnrichmentTablePlaceholder'
}
</script>

<style scoped>

</style>

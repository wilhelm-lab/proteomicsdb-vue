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
          Did you just upload this dataset?<br>
          Then the enrichment analysis is probably still running.<br>
          If it still is not here after a few minutes, something probably went wrong.<br>
          Please contract a site administrator.<br>
          Please note that PTM-SEA, KSEA and KSEA+RoKAI can be performed only for Phosphoproteomic datasets.<br>
          For other PTM datasets as well as Protein-level datasets, only GSEA is performed.<br>
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

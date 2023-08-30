<template>
  <v-dialog
    v-if="$vuetify.breakpoint.mdAndDown"
    :value="true"
    fullscreen
    @click:outside="close"
  >
    <v-card class="dialog-page-fullscreen">
      <v-toolbar
        class="px-2"
        elevation="0"
        color="primary"
        dark
        dense
      >
        <v-btn
          text
          class="mr-2"
          @click="close"
        >
          <v-icon left>
            mdi mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
        <v-toolbar-title class="d-flex align-center">
          <slot name="title" />
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="close"
        >
          <v-icon>mdi mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <slot />
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog
    v-else
    :value="true"
    content-class="dialog-page"
    @click:outside="close"
  >
    <v-card class="dialog-page__card">
      <div class="d-flex justify-end">
        <v-btn
          text
          fab
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-card-title class="pt-0">
        <slot name="title" />
      </v-card-title>
      <v-card-text>
        <slot />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  methods: {
    close () {
      this.$router.push(this.$route.matched[this.$route.matched.length - 2])
    }
  }
}
</script>

<style lang="scss">
.dialog-page {
  max-width: 1800px;
}
.dialog-page__card {
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-page-fullscreen {
  height: 100vh;
  width: 100vw;
  overflow-y: auto;
}
</style>

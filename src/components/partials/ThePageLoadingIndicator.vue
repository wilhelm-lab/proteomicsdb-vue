<template>
  <v-progress-linear
    v-if="isPageLoading"
    class="page-loading-indicator"
    indeterminate
    color="yellow darken-2"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters({
      isPageLoading: 'getIsPageLoading'
    })
  }
}
</script>

<style scoped>
.page-loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}
</style>

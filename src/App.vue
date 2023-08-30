<template>
  <v-app
    id="inspire"
    style="overflow:hidden"
  >
    <ThePageLoadingIndicator />
    <TheNotificationSnackbars />

    <TheAppBar />

    <router-view />

    <v-footer
      app
      absolute
      color="primary"
      class="white--text"
      :class="$vuetify.breakpoint.smAndDown ? 'mt-12' : ''"
    >
      <span>TUM &copy;{{ new Date().getFullYear() }}</span>
      <v-spacer />
      <v-btn
        x-small
        text
        class="white--text"
        :to="{ name: 'about' }"
      >
        About us
      </v-btn>
      <v-divider vertical />
      <v-btn
        x-small
        text
        class="white--text"
        :to="{ name: 'faq' }"
      >
        Frequently asked questions
      </v-btn>
      <v-divider vertical />
      <v-btn
        x-small
        text
        class="white--text"
        :to="{ name: 'api' }"
      >
        Programmatic access - API
      </v-btn>
      <v-divider vertical />
      <v-btn
        x-small
        text
        class="white--text"
        :to="{ name: 'apiv2' }"
      >
        Programmatic access - APIv2 BETA
      </v-btn>
      <v-divider vertical />
      <v-btn
        x-small
        text
        class="white--text"
        :to="{ name: 'about' }"
      >
        Contact us
      </v-btn>
      <v-divider vertical />
      <v-btn
        x-small
        text
        class="white--text"
        :to="{ name: 'disclaimer' }"
      >
        Terms of use
      </v-btn>
      <v-divider vertical />
      <v-btn
        x-small
        text
        class="white--text"
        href="https://www1.ls.tum.de/proteomics/home/"
        target="_blank"
      >
        Impressum
      </v-btn>
      <v-spacer />
    </v-footer>
  </v-app>
</template>

<script>
import TheNotificationSnackbars from './components/partials/TheNotificationSnackbars'
import ThePageLoadingIndicator from './components/partials/ThePageLoadingIndicator'
import TheAppBar from './components/partials/TheAppBar'

export default {
  components: {
    TheNotificationSnackbars,
    ThePageLoadingIndicator,
    TheAppBar
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to) {
        const taxcode = parseInt(this.$cookie.get('organism') || '9606')
        await this.$store.dispatch('switchOrganism', { taxcode })
        await this.switchToTaxcodeUrlQuery()
        await this.switchToAvailableOrganism()
      }
    }
  },
  methods: {
    async switchToTaxcodeUrlQuery () {
      if (this.$route.query.taxcode) {
        await this.$store.dispatch('switchOrganism', {
          taxcode: parseInt(this.$route.query.taxcode),
          notifyUser: true
        })
      }
    },
    async switchToAvailableOrganism () {
      let availableOrganisms = [this.$store.state.organismTaxcode]

      for (const route of this.$route.matched) {
        if (route.meta.availableOrganisms && route.meta.availableOrganisms > 0) {
          availableOrganisms = route.meta.availableOrganisms
        }
      }

      if (!availableOrganisms.includes(this.$store.state.organismTaxcode)) {
        await this.$store.dispatch('switchOrganism', {
          taxcode: availableOrganisms[0],
          notifyUser: true
        })
      }
    }
  }
}
</script>

<style lang="scss">
.v-application--wrap {
  background-color: #eee;
}

/*
 * Global DxDataGrid styles
 */
.dx-state-hover {
  cursor: pointer;
}

.dx-pager .dx-page-sizes .dx-selection, .dx-pager .dx-pages .dx-selection {
  background-color: #b0b0b0;
}
</style>

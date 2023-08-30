<template>
  <div
    class="organism-select"
  >
    <v-menu
      offset-y
    >
      <template #activator="{ on, attrs }">
        <v-btn
          color="secondary"
          v-bind="attrs"
          class="organism-select-button"
          :x-small="xSmall"
          :small="small"
          :x-large="xLarge"
          :large="large"
          v-on="on"
        >
          <v-icon
            v-if="activeOrganism.icon"
            left
          >
            {{ activeOrganism.icon }}
          </v-icon>
          {{ activeOrganism.text }}
          <v-icon
            v-if="isAvailableOrganisms"
            right
          >
            mdi mdi-alert-box
          </v-icon>
          <v-icon
            v-else
            right
          >
            mdi mdi-chevron-down
          </v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          v-for="(organism, index) in selectableOrganisms"
          :key="index"
          link
          :disabled="organism.taxcode === activeOrganism.taxcode"
          @click="selectOrganism(organism.taxcode)"
        >
          <v-list-item-icon
            v-if="organism.icon"
          >
            <v-icon>
              {{ organism.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{ organism.text }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="isAvailableOrganisms"
          color="warning"
          :input-value="true"
        >
          <v-list-item-icon>
            <v-icon>
              mdi mdi-alert-box
            </v-icon>
          </v-list-item-icon>
          <v-list-item-title>This page is only available for a limited set of organisms</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-dialog
      v-model="redirectDialog"
      width="500"
    >
      <v-card>
        <v-card-title class="text-h5 white--text secondary">
          Redirect Warning
        </v-card-title>
        <v-card-text class="mt-6">
          Switching the organism on this page will redirect you to
          <code>{{ redirectToUrl }}</code>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="error"
            text
            @click="resetRedirectDialog()"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            text
            @click="switchOrganismAndRedirect()"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    xSmall: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    large: {
      type: Boolean,
      default: false
    },
    xLarge: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    redirectDialog: false,
    redirectTaxcode: null
  }),
  computed: {
    ...mapGetters({
      activeOrganism: 'getOrganism'
    }),
    /** @returns {any[]} */
    selectableOrganisms () {
      let organisms = Object.values(this.$store.state.organisms)

      if (this.isAvailableOrganisms) {
        organisms = organisms.filter(organism =>
          this.availableOrganisms.includes(organism.taxcode)
        )
      }

      return organisms
    },
    /** @returns {boolean} */
    isAvailableOrganisms () {
      return this.availableOrganisms && this.availableOrganisms.length > 0
    },
    /** @returns {string} */
    redirectTo () {
      let redirectTo = ''

      for (const route of this.$route.matched) {
        if (route.meta.redirectOnOrganismSelectTo) {
          redirectTo = route.meta.redirectOnOrganismSelectTo
        }
      }

      return redirectTo
    },
    /** @returns {string} */
    redirectToUrl () {
      const { href } = this.$router.resolve({
        name: this.redirectTo
      })

      return href
    },
    /** @returns {boolean} */
    shouldRedirect () {
      return this.redirectTo && this.$route.name !== this.redirectTo
    },
    /** @returns {any[]} */
    availableOrganisms () {
      let availableOrganisms = []

      for (const route of this.$route.matched) {
        if (route.meta.availableOrganisms && route.meta.availableOrganisms > 0) {
          availableOrganisms = route.meta.availableOrganisms
        }
      }

      return availableOrganisms
    }
  },
  methods: {
    ...mapActions({
      switchOrganism: 'switchOrganism'
    }),
    selectOrganism (taxcode) {
      if (this.shouldRedirect) {
        this.redirectDialog = true
        this.redirectTaxcode = taxcode
      } else {
        this.switchOrganism({ taxcode })
      }
    },
    switchOrganismAndRedirect () {
      this.switchOrganism({ taxcode: this.redirectTaxcode })
      this.resetRedirectDialog()

      if (this.redirectTo && this.$route.name !== this.redirectTo) {
        this.$router.push({
          name: this.redirectTo
        })
      }
    },
    resetRedirectDialog () {
      this.redirectDialog = false
      this.redirectTaxcode = null
    }
  }
}
</script>

<style lang="scss">
.organism-select-button {
  .v-btn__content {
    text-transform: capitalize;
  }
}
</style>

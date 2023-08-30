<template>
  <v-app-bar
    app
    clipped-left
    clipped-right
    dark
    extension-height="40px"
    color="primary"
  >
    <v-toolbar-items
      v-if="!showMobileSearch"
      class="flex-grow-1 align-center justify-space-between"
    >
      <div class="d-flex flex-row align-center">
        <v-btn
          x-large
          text
          dark
          :to="{ name: 'home' }"
          class="app-logo ml-2 mr-md-4 hidden-xs-only"
          active-class="active"
        >
          <img
            width="40"
            :src="require('@/assets/prdbIcon.png')"
            class="mr-2"
          >
          <span class="hidden-sm-and-down">ProteomicsDB</span>
        </v-btn>

        <OrganismSelect
          :small="$vuetify.breakpoint.smAndDown"
          class="ml-2 mr-2 mr-md-6"
        />
      </div>

      <SearchBar
        dense
        class="app-search-bar mr-4 hidden-sm-and-down"
      />

      <div class="d-flex flex-row align-center">
        <v-btn
          class="hidden-md-and-up"
          fab
          :small="$vuetify.breakpoint.xs"
          text
          @click="showMobileSearch = true"
        >
          <v-icon>
            mdi mdi-magnify
          </v-icon>
        </v-btn>
        <v-menu
          transition="slide-y-transition"
          bottom
          small
          offset-y
        >
          <template #activator="{ on, attrs }">
            <v-btn
              :fab="$vuetify.breakpoint.smAndDown"
              :small="$vuetify.breakpoint.xs"
              text
              v-bind="attrs"
              v-on="on"
            >
              <v-icon class="mr-lg-2">
                mdi mdi-message-alert
              </v-icon>
              <span class="hidden-md-and-down">
                Give Feedback
              </span>
            </v-btn>
          </template>
          <v-list>
            <feedback-form />
            <!-- TODO: Re-enable this when the community backend is ready -->
            <!-- <v-list-item
              :to="{ name: 'ideaSubmission' }"
            >
              <v-list-item-icon>
                <v-icon>mdi mdi-lightbulb-on</v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                Submit an idea
              </v-list-item-title>
            </v-list-item> -->
          </v-list>
        </v-menu>
        <v-menu
          transition="slide-y-transition"
          bottom
          small
          offset-y
        >
          <template #activator="{ on, attrs }">
            <v-btn
              :fab="$vuetify.breakpoint.mdAndDown"
              :small="$vuetify.breakpoint.xs"
              text
              v-bind="attrs"
              v-on="on"
            >
              <v-icon class="mr-lg-2">
                mdi mdi-help-circle
              </v-icon>
              <span class="hidden-md-and-down">
                Help
              </span>
            </v-btn>
          </template>
          <v-list>
            <v-dialog
              v-model="showHelp"
              width="600"
            >
              <template #activator="{ on, attrs }">
                <v-list-item
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-list-item-icon>
                    <v-icon>mdi mdi-file-question</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    Help for current page
                  </v-list-item-title>
                </v-list-item>
              </template>
              <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                  Help for current page
                </v-card-title>

                <!-- eslint-disable vue/no-v-html -->
                <v-card-text
                  class="pa-4"
                  v-html="$sanitizeHtml(helpHTML)"
                />
                <!-- eslint-enable vue/no-v-html -->

                <v-divider />
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    color="primary"
                    text
                    @click="showHelp = false"
                  >
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-list-item :to="{ name: 'faq' }">
              <v-list-item-icon>
                <v-icon>mdi mdi-frequently-asked-questions</v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                FAQ
              </v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'api' }">
              <v-list-item-icon>
                <v-icon>mdi mdi-console-line</v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                API Documentation
              </v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'apiv2' }">
              <v-list-item-icon>
                <v-icon>mdi mdi-api</v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                APIv2 (beta) Documentation
              </v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'about' }">
              <v-list-item-icon>
                <v-icon>mdi mdi-information</v-icon>
              </v-list-item-icon>
              <v-list-item-title>
                About Us
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-toolbar-items>

    <v-toolbar-items
      v-else
      class="flex-grow-1 align-center justify-space-between"
    >
      <v-btn
        fab
        text
        small
        @click="showMobileSearch = false"
      >
        <v-icon>
          mdi mdi-arrow-left
        </v-icon>
      </v-btn>

      <SearchBar
        class="app-search-bar mr-4"
        dense
      />
    </v-toolbar-items>

    <template #extension>
      <v-tabs
        light
        background-color="white"
        :show-arrows="$vuetify.breakpoint.smAndDown"
      >
        <v-tab
          :to="{ name: 'home' }"
          exact
        >
          <v-icon
            small
            class="mr-2"
          >
            mdi mdi-home
          </v-icon>
          Home
        </v-tab>
        <v-tab
          :to="{ name: 'proteinHome' }"
        >
          <v-icon
            small
            class="mr-2"
          >
            $vuetify.icons.protein
          </v-icon>
          Protein
        </v-tab>
        <v-tab
          :to="{ name: 'projectHome' }"
        >
          <v-icon
            small
            class="mr-2"
          >
            mdi mdi-folder
          </v-icon>
          Project
        </v-tab>
        <v-tab
          :to="{ name: 'drugHome' }"
        >
          <v-icon
            small
            class="mr-2"
          >
            mdi mdi-pill
          </v-icon>
          Drug
        </v-tab>
        <v-tab :to="{ name: 'analytics' }">
          <v-icon
            small
            class="mr-2"
          >
            mdi mdi-chart-arc
          </v-icon>
          Analytics
        </v-tab>
        <!-- <v-tab :to="{ name: 'community' }">
          <v-icon
            small
            class="mr-2"
          >
            mdi mdi-account-group
          </v-icon>Community
        </v-tab> -->
      </v-tabs>
    </template>
  </v-app-bar>
</template>

<script>
import axios from 'axios'
import OrganismSelect from '@/components/OrganismSelect.vue'
import SearchBar from '@/components/SearchBar'
import FeedbackForm from '@/components/FeedbackForm'

export default {
  components: {
    OrganismSelect,
    SearchBar,
    FeedbackForm
  },
  data: () => ({
    showHelp: false,
    showMobileSearch: false,
    helpHTML: ''
  }),
  watch: {
    $route: {
      immediate: true,
      handler (to) {
        this.showHelp = false
        this.getHelpHTML(to.meta.helpKey)
      }
    }
  },
  methods: {
    async getHelpHTML (key) {
      if (key) {
        const response = await axios.get(
          `${this.$store.state.host}/proteomicsdb/help/${key}.fragment.html`
        )
        // First and two last lines are SAP-specific and not valid HTML, so cut them off
        this.helpHTML = response.data.split('\n').slice(1, -2).join('\n')
      } else {
        this.helpHTML = '<strong> Sorry, no help available for this component! </strong>'
      }
    }
  }
}
</script>

<style lang="scss">
.v-toolbar__content {
  padding-right: 0 !important;
  padding-left: 0 !important;
}

.app-search-bar {
  max-width: 800px;
}

.app-logo {
  padding: 0 !important;
}

.app-logo.active.v-btn--active::before {
  opacity: 0;
  background-color: none;
}
</style>

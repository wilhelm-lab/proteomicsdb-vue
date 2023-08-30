
<template>
  <v-dialog
    v-model="showDialog"
    width="600"
  >
    <template #activator="{ on, attrs }">
      <v-list-item
        v-bind="attrs"
        v-on="on"
      >
        <v-list-item-icon>
          <v-icon>mdi mdi-alert-decagram</v-icon>
        </v-list-item-icon>
        <v-list-item-title>
          Report a problem
        </v-list-item-title>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title class="text-h5 grey lighten-2">
        Report a problem
      </v-card-title>

      <v-card-text
        class="pa-4"
      >
        <v-form
          v-if="!loading && !success && !error"
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-text-field
            v-model="url"
            outlined
            label="Feedback for URL (current page)"
            required
            :rules="urlRules"
          />

          <v-text-field
            v-model="email"
            outlined
            label="E-mail (optional)"
            :rules="emailRules"
          />

          <v-textarea
            v-model="message"
            outlined
            name="input-7-4"
            label="Your feedback message"
            :rules="messageRules"
            required
          />
        </v-form>

        <div class="d-flex justify-space-around">
          <v-progress-circular
            v-if="loading"
            :size="50"
            indeterminate
          />
        </div>

        <v-alert
          v-if="success && !error"
          type="success"
        >
          <v-row align="center">
            <v-col class="grow">
              {{ successMessage }}
            </v-col>
            <v-col class="shrink">
              <v-btn @click="close()">
                Close
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>

        <v-alert
          v-if="error"
          type="error"
        >
          <v-row align="center">
            <v-col class="grow">
              {{ errorMessage }}
              <a
                class="white--text"
                :href="'mailto:'+errorMessageContact"
              >{{ errorMessageContact }}</a>
            </v-col>
            <v-col class="shrink">
              <v-btn @click="reset()">
                Try again
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="close()"
        >
          Close
        </v-btn>
        <v-btn
          v-if="!success && !error"
          color="primary"
          :disabled="!valid"
          @click="submit()"
        >
          Send
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// TODO: there is a current bug in vuetify that closes the dialog when text is selected.
//       It is adressed in https://github.com/vuetifyjs/vuetify/commit/0ef59de322641d1a1d08380918f073ddc4d23209
//       and the only way to resolve would be update vuetify or patch the package.
import axios from 'axios'

export default {
  data () {
    return {
      showDialog: false,
      valid: true,
      url: '',
      urlRules: [
        v => !!v || 'URL is required'
      ],
      email: '',
      emailRules: [
        v => (/.+@.+\..+/.test(v) || v.length === 0) || 'Please enter a valid E-Mail'
      ],
      message: '',
      messageRules: [
        v => !!v || 'Feedback message is required',
        v => (v && v.length >= 10) || 'Feedback message must be longer than 10 characters.'
      ],
      loading: false,
      success: false,
      successMessage: 'Thank you for your feedback we will review it soon!',
      error: false,
      errorMessage: `There was an error processing your feedback request. Please try again later.
                     If the issue persists please contact us directly at: `,
      errorMessageContact: 'proteomicsdb.wzw@tum.de'
    }
  },
  watch: {
    $route () {
      this.setUrlToCurrentPage()
    }
  },
  mounted () {
    this.setUrlToCurrentPage()
  },
  methods: {
    async submit () {
      await this.$refs.form.validate()
      if (this.valid) {
        // TODO: should be POST request. Might need adjustment on backend.
        // TODO: backend doesn't validate
        try {
          this.loading = true

          await axios.get(this.$store.state.host + '/logic/secure/sendFeedback.xsjs',
            {
              params: {
                url: this.url,
                email: this.email,
                description: this.message
              }
            }
          )

          this.success = true
        } catch (e) {
          this.error = true
        } finally {
          this.loading = false
        }
      }
    },
    setUrlToCurrentPage () {
      this.url = window.location.href
    },
    reset () {
      this.error = false
      this.success = false
      this.loading = false
    },
    close () {
      this.showDialog = false
      this.reset()
    }
  }
}
</script>

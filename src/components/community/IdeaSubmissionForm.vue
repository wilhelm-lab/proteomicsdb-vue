<template>
  <v-card elevation="0">
    <v-card-title class="mb-4">
      Idea Submission
    </v-card-title>
    <v-card-text>
      <v-form v-model="isFormValid">
        <v-row>
          <v-col cols="8">
            <v-row>
              <v-col
                v-for="field in fields"
                :key="field.label"
                cols="12"
              >
                <v-textarea
                  v-model="ideaElements[field.modelName]"
                  :counter="field.counter"
                  outlined
                  auto-grow
                  rows="1"
                  :hint="`Please enter the ${field.label}`"
                  persistent-hint
                  persistent-placeholder
                  :placeholder="`Please enter the ${field.label}`"
                  :label="field.label+'*'"
                  :rules="[(v) => !!v || `This field must be filled with the ${field.label}`]
                    .concat([(v) => (v || '' ).length <= field.counter ||
                      `${field.label} must be ${field.counter} characters or less`])"
                  :error-messages="errorMessages"
                />
              </v-col>
              <!--             <v-col
                v-if="analyticsLink && analyticsLinkPath.startsWith('/analytics')"
                cols="12"
              >
                <v-textarea
                  v-model="analyticsLinkPath"
                  outlined
                  auto-grow
                  :disabled="true"
                  label="Analytics Link (optional)"
                  hint="Your Idea will be linked to the Analytics Page"
                  rows="1"
                />
              </v-col> -->
            </v-row>
          </v-col>
          <v-col cols="4">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="username"
                  outlined
                  label="Username (optional)"
                  hint="Your Name will be displayed on the Idea"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="twitterName"
                  outlined
                  label="Twitter Name (optional)"
                  hint="Please enter your Twitter Name"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12">
                <v-combobox
                  v-model="tags"
                  :items="tagItems"
                  :search-input.sync="search"
                  hide-selected
                  label="Tags*"
                  multiple
                  chips
                  deletable-chips
                  hint="Please enter a maximum of 10 Tags"
                  persistent-hint
                  :rules="[...rules.requiredCombobox, rules.maximumTags]"
                  :error-messages="errorMessages"
                >
                  <template #no-data>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          No results matching "<strong>{{ search }}</strong>".
                          Press <kbd>enter</kbd> to create a new one
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-combobox>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions class="pa-3">
      <v-row>
        <v-col cols="12">
          <v-row justify="end">
            <v-col cols="2">
              <v-btn
                width="100%"
                :disabled="!isFormValid"
                color="primary"
                @click="submitIdea"
              >
                Submit
              </v-btn>
            </v-col>
            <v-col cols="2">
              <v-btn
                :to="{name: 'community'}"
                width="100%"
                outlined
                color="error"
              >
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  name: 'IdeaSubmissionForm',
  props: {
    ideas: {
      type: Array,
      default: null
    }
    /* analyticsLink: {
      type: String,
      default: null
    } */
  },
  data: () => ({
    tagItems: ['Gaming', 'Programming', 'Vue', 'Vuetify'],
    tags: ['ProteomicsDB'],
    ideaElements: {
      ideaTitle: '',
      ideaDescription: '',
      ideaPurpose: '',
      ideaFeatures: '',
      ideaImplementation: ''
    },
    twitterName: '',
    username: '',
    search: null,
    errorMessages: '',
    isFormValid: false,
    rules: {
      requiredCombobox: [(v) => v.length > 0 || 'This field must be filled.'],
      maximumTags: [(v) => v.length < 11 || 'Maximum of 10 Tags']
    },
    fields: [
      { label: 'Idea Title', counter: 100, modelName: 'ideaTitle' },
      { label: 'Idea Description', counter: 500, modelName: 'ideaDescription' },
      { label: 'Idea Purpose', counter: 500, modelName: 'ideaPurpose' },
      { label: 'Features to Include', counter: 500, modelName: 'ideaFeatures' },
      { label: 'Idea Implementation Approach', counter: 500, modelName: 'ideaImplementation' }
    ]
    // analyticsLinkPath: ''
  }),

  watch: {
    tags (val) {
      if (val.length > 11) {
        this.$nextTick(() => this.tags.pop())
      }
    },
    errorMessage () {
      this.errorMessages = ''
    }
    /* analyticsLink () {
      this.analyticsLinkPath = this.analyticsLink.path
    } */
  },
  methods: {
    submitIdea () {
      this.$store.dispatch(
        'community/submitIdea',
        {
          ideaTitle: this.ideaElements.ideaTitle,
          ideaDescription: this.ideaElements.ideaDescription,
          ideaPurpose: this.ideaElements.ideaPurpose,
          ideaFeatures: this.ideaElements.ideaFeatures,
          ideaImplementation: this.ideaElements.ideaImplementation,
          tags: this.tags,
          twitterName: this.twitterName,
          username: !this.username ? 'anonymous' : this.username,
          upvotes: 0,
          comments: [],
          analyticsLink: '' // !this.analyticsLink ? '' : this.analyticsLinkPath
        }
      )
      this.$emit('setSubmissionValid', true)
    }
  }
}
</script>

<style scoped>

</style>

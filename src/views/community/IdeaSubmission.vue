<template>
  <v-main>
    <v-container
      fluid
      ml-5
    >
      <v-row
        id="citation"
        justify="center"
        class="ma-2"
      >
        <v-col cols="9">
          <idea-submission-form
            :ideas="ideas"
            :analytics-link="prevRoute && prevRoute.path !== '/' ? prevRoute : undefined"
            @setSubmissionValid="isSubmissionValid"
          />
          <idea-submission-snackbar :submission-valid="submissionValid" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import { mapState } from 'vuex'
import IdeaSubmissionForm from '../../components/community/IdeaSubmissionForm'
import IdeaSubmissionSnackbar from '../../components/community/IdeaSubmissionSnackbar'

export default {
  name: 'IdeaSubmission',
  components: { IdeaSubmissionSnackbar, IdeaSubmissionForm },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  data: () => ({
    submissionValid: false,
    prevRoute: null
  }),
  computed: {
    ...mapState('community', {
      ideas: 'ideas'
    })
  },
  methods: {
    isSubmissionValid (val) {
      this.submissionValid = val
    }
  }
}
</script>

<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="600px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        :small="!isIdeaComment"
        dark
        v-bind="attrs"
        v-on="on"
      >
        Comment
      </v-btn>
    </template>
    <v-card elevation="0">
      <v-card-title class="mb-2">
        Add new comment
      </v-card-title>
      <v-card-text>
        <v-form v-model="isFormValid">
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="username"
                  outlined
                  label="Username (optional)"
                  hint="Your Name will be displayed on the Comment"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="comment"
                  :counter="500"
                  outlined
                  auto-grow
                  rows="1"
                  :hint="`Please enter your Comment`"
                  persistent-hint
                  label="Comment*"
                  :rules="rules.required
                    .concat([(v) => (v || '' ).length <= 500 ||
                      `Comment must be 500 characters or less`])"
                  :error-messages="errorMessages"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          class="white--text"
          :disabled="!isFormValid"
          @click="submitComment"
        >
          Submit
        </v-btn>
        <v-btn
          dark
          @click="dialog = false"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'CommentDialog',
  props: {
    isIdeaComment: {
      type: Boolean,
      default: null
    },
    ideasId: {
      type: Number,
      default: null
    },
    commentId: {
      type: Number,
      default: null
    }
  },
  data: () => ({
    username: '',
    isFormValid: false,
    dialog: false,
    errorMessages: '',
    comment: null,
    rules: {
      required: [(v) => !!v || 'required Field']
    }
  }),
  watch: {
    errorMessage () {
      this.errorMessages = ''
    }
  },
  methods: {
    submitComment () {
      this.dialog = false
      if (this.isIdeaComment) {
        this.$store.dispatch(
          'community/submitIdeaComment',
          {
            comment: this.comment,
            ideasId: this.ideasId,
            username: !this.username ? 'anonymous' : this.username
          }
        )
      } else {
        this.$store.dispatch(
          'community/submitCommentReply',
          {
            comment: this.comment,
            ideasId: this.ideasId,
            commentId: this.commentId,
            username: !this.username ? 'anonymous' : this.username
          }
        )
      }
      this.username = ''
      this.comment = null
    }
  }
}
</script>

<style scoped>

</style>

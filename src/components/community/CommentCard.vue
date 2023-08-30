<template>
  <v-row justify="end">
    <v-col cols="11">
      <v-card
        class="mb-3"
        elevation="0"
      >
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="11">
                <v-col cols="12">
                  <div class="caption text--primary">
                    Posted by
                    <b>{{ ideaComment.username }}</b>
                    on
                    <b>{{ new Date(ideaComment.commentCreatedDate).toLocaleString('de-DE', {timeZone: 'UTC'}) }}</b>
                  </div>
                </v-col>
                <v-col cols="12">
                  {{ ideaComment.commentText }}
                </v-col>
              </v-col>
              <v-col
                class="d-flex justify-center"
                cols="1"
              >
                <div>
                  <v-btn
                    :disabled="isUpvoted"
                    icon
                    small
                    @click="upvote"
                  >
                    <v-icon>
                      mdi mdi-chevron-up
                    </v-icon>
                  </v-btn>
                  <div
                    class="d-flex justify-center"
                    style="font-size: 16px;"
                  >
                    {{ ideaComment.nrCommentVotes }}
                  </div>
                  <v-btn
                    :disabled="isDownvoted"
                    icon
                    small
                    @click="downvote"
                  >
                    <v-icon>
                      mdi mdi-chevron-down
                    </v-icon>
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-col cols="12">
            <v-container>
              <v-row justify="end">
                <v-btn
                  disabled
                  small
                  text
                >
                  {{ ideaComment.nrCommentReplies }} Replies
                </v-btn>
                <comment-dialog
                  :comment-id="ideaComment.commentId"
                  :ideas-id="ideaComment.ideasId"
                  :is-idea-comment="false"
                />
              </v-row>
            </v-container>
          </v-col>
        </v-card-actions>
      </v-card>
      <v-row justify="end">
        <v-col cols="11">
          <div v-if="ideaComment.commentReplies.length > 0">
            <comment-reply-card
              :comment-replies="ideaComment.commentReplies"
            />
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import CommentDialog from './CommentDialog'
import CommentReplyCard from './CommentReplyCard'
import { mapState } from 'vuex'

export default {
  name: 'CommentCard',
  components: { CommentReplyCard, CommentDialog },
  props: {
    ideaComment: {
      type: Object,
      default: null
    }
  },
  data: () => ({
    isUpvoted: null,
    isDownvoted: null
  }),
  computed: {
    ...mapState('community', {
      commentVotesInLocalStorage: 'commentVotesInLocalStorage'
    })
  },
  watch: {
    commentVotesInLocalStorage () {
      const isVoteInLocalStorage = this.commentVotesInLocalStorage.find(x => x.id === this.ideaComment.ideasId + 'c' + this.ideaComment.commentId)
      if (isVoteInLocalStorage) {
        if (isVoteInLocalStorage.value.startsWith('1')) {
          this.isUpvoted = true
          this.isDownvoted = false
        }
        if (isVoteInLocalStorage.value.startsWith('0')) {
          this.isUpvoted = false
          this.isDownvoted = true
        }
      } else {
        this.isUpvoted = false
        this.isDownvoted = false
      }
    }
  },
  mounted () {
    this.isUpvoted = !!(localStorage.getItem(this.ideaComment.ideasId + 'c' + this.ideaComment.commentId) &&
                localStorage.getItem(this.ideaComment.ideasId + 'c' + this.ideaComment.commentId).startsWith('1'))
    this.isDownvoted = !!(localStorage.getItem(this.ideaComment.ideasId + 'c' + this.ideaComment.commentId) &&
                localStorage.getItem(this.ideaComment.ideasId + 'c' + this.ideaComment.commentId).startsWith('0'))
  },
  methods: {
    upvote () {
      this.$store.dispatch(
        'community/voteComment',
        {
          commentId: this.ideaComment.commentId, vote: 1, ideasId: this.ideaComment.ideasId
        }
      )
    },
    downvote () {
      this.$store.dispatch(
        'community/voteComment',
        {
          commentId: this.ideaComment.commentId, vote: -1, ideasId: this.ideaComment.ideasId
        }
      )
    }
  }
}
</script>

<style scoped>

</style>

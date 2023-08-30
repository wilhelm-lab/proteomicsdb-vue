<template>
  <v-main>
    <v-container fluid>
      <v-row
        class="ma-2"
        justify="center"
      >
        <v-col cols="9">
          <v-row>
            <v-col cols="1">
              <v-fab-transition>
                <v-btn
                  :to="{name: 'community'}"
                  fab
                  small
                  text
                >
                  <v-icon>mdi mdi-arrow-left</v-icon>
                </v-btn>
              </v-fab-transition>
            </v-col>
            <v-col :cols="idea.analyticsLink ? 8 : 10">
              <idea-card
                :details="true"
                :idea="idea"
                :idea-comments-counter="ideaCommentsCounter"
                :idea-votes-counter="ideaVotesCounter"
                :idea-tags="ideaTags"
              />
              <div
                v-for="ideaComment in idea.ideaComments"
                :key="ideaComment.commentId"
              >
                <comment-card
                  :idea-comment="ideaComment"
                />
              </div>
            </v-col>
            <v-col :cols="idea.analyticsLink ? 3 : 0">
              <v-row>
                <v-col
                  v-if="idea.analyticsLink"
                  cols="12"
                >
                  <v-card>
                    <v-card-text>
                      <div class="text">
                        Linked Analytics:
                      </div>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn
                        :to="{path: idea.analyticsLink}"
                        small
                        text
                      >
                        To ProteomicsDB
                        <v-icon
                          class="pl-2"
                          x-small
                        >
                          mdi mdi-link
                        </v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import { mapState } from 'vuex'
import IdeaCard from '../../components/community/IdeaCard'
import CommentCard from '../../components/community/CommentCard'

export default {
  name: 'IdeaDetails',
  components: { CommentCard, IdeaCard },
  computed: {
    ...mapState('community', {
      ideaComments: 'ideaComments',
      ideaCommentsCounter: 'ideaCommentsCounter',
      ideaVotes: 'ideaVotes',
      ideaVotesCounter: 'ideaVotesCounter',
      ideaTags: 'ideaTags',
      commentVotes: 'commentVotes'
    }),
    /** @returns {{ analyticsLink: string, ideaComments: { commentId: number }[]}} */
    idea () {
      return this.$store.state.community.idea
    }
  },
  mounted () {
    this.$store.dispatch('community/loadIdea', this.$route.params.id)
  }
}
</script>

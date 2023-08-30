<template>
  <v-card
    v-if="idea"
    class="mb-3"
    elevation="0"
  >
    <v-card-title>
      <v-col cols="11">
        <v-row>
          <v-col
            cols="12"
            class="d-flex align-end pb-0"
          >
            <div
              :class="{'text-wrap pl-4': details === true, 'd-inline-block text-truncate pl-4': details !== true}"
              style="max-width: 100%"
            >
              {{ idea.ideaTitle }}
            </div>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col
            cols="12"
            class="pt-0"
          >
            <v-card-subtitle class="caption text--primary py-0">
              Posted by <b>{{ idea.username }}</b> on <b>{{ new Date(idea.ideaCreatedDate).toLocaleString('de-DE', {timeZone: 'UTC'}) }}</b>
            </v-card-subtitle>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            class="py-0"
          >
            <v-chip
              v-if="ideaStatus"
              class="ml-4"
              :color="ideaStatus.find(x => x.id === idea.ideaStatus) ?
                ideaStatus.find(x => x.id === idea.ideaStatus).color : $vuetify.theme.themes.light.primary"
              label
              outlined
              small
            >
              {{ idea.ideaStatus }}
            </v-chip>
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="
              1"
        class="d-flex justify-center"
      >
        <!-- Carefull: Upvote and Downvote enabling and disabling of Up- and Down Votes is buggy! must be checked differently with its own coockie-->
        <div v-if="votesInLocalStorage">
          <v-btn
            icon
            :disabled="isUpvoted"
            @click="upvote"
          >
            <v-icon>
              mdi mdi-chevron-up
            </v-icon>
          </v-btn>
          <div
            class="d-flex justify-center"
            style="font-size: 20px;"
          >
            {{ idea.nrIdeaVotes }}
          </div>
          <v-btn
            icon
            :disabled="isDownvoted"
            @click="downvote"
          >
            <v-icon>
              mdi mdi-chevron-down
            </v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-container fluid>
        <v-row>
          <v-col :cols="`${details === true ? 12 : 11}`">
            <v-row>
              <v-col
                cols="12"
                class="pb-0 pt-0"
              >
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>Idea Description</v-list-item-title>
                    <v-list-item-subtitle
                      :class="{'text-wrap': details === true, 'd-inline-block text-truncate': details !== true}"
                    >
                      {{ idea.ideaDescription }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                class="pb-0"
              >
                <v-list-item three-line>
                  <v-list-item-content>
                    <v-list-item-title>Idea Purpose</v-list-item-title>
                    <v-list-item-subtitle
                      :class="{'text-wrap': details === true, 'd-inline-block text-truncate': details !== true}"
                    >
                      {{ idea.ideaPurpose }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                class="pb-0"
              >
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>Features to Include</v-list-item-title>
                    <v-list-item-subtitle
                      :class="{'text-wrap': details === true, 'd-inline-block text-truncate': details !== true}"
                    >
                      {{ idea.ideaFeatures }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            <v-row>
              <v-col
                cols="12"
                class="pb-0"
              >
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>Idea Implementation Approach</v-list-item-title>
                    <v-list-item-subtitle
                      :class="{'text-wrap': details === true, 'd-inline-block text-truncate': details !== true}"
                    >
                      {{ idea.ideaImplementation }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            <v-row v-if="details">
              <v-col>
                <v-chip
                  v-for="tag in ideaTags"
                  :key="tag"
                  class="ma-1"
                >
                  {{ tag }}
                </v-chip>
              </v-col>
            </v-row>
          </v-col>
          <v-col
            v-if="!details"
            cols="1"
            class="d-flex justify-center"
          >
            <div>
              <v-btn
                icon
                class="d-flex justify-center mb-3"
                disabled
              >
                <v-icon>
                  mdi mdi-gitlab
                </v-icon>
              </v-btn>
              <v-btn
                icon
                class="d-flex justify-center"
                disabled
              >
                <v-icon>
                  mdi mdi-chart-pie
                </v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-col
        v-if="!details"
        cols="6"
      >
        <v-btn
          text
          outlined
          :to="{name: 'idea', params: {'id': idea.ideasId}}"
        >
          View Details
        </v-btn>
      </v-col>
      <v-col :cols="`${details === true ? 12 : 6}`">
        <v-container>
          <v-row justify="end">
            <v-btn
              text
              disabled
            >
              {{ idea.nrIdeaComments }} Comments
            </v-btn>
            <comment-dialog
              v-if="details"
              :is-idea-comment="true"
              :ideas-id="idea.ideasId"
            />
          </v-row>
        </v-container>
      </v-col>
    </v-card-actions>
  </v-card>
</template>

<script>
import CommentDialog from './CommentDialog'
import { mapState } from 'vuex'
// import { defaults } from 'lodash-es'
export default {
  name: 'IdeaCard',
  components: { CommentDialog },
  props: {
    idea: {
      type: Object,
      default: null
    },
    details: {
      type: Boolean,
      default: null
    },
    ideaTags: {
      type: Array,
      default: null
    }
  },
  data: () => ({
    ideaStatus: [
      { id: 'New', color: '#0065BD' },
      { id: 'Planned', color: '#6cbbff' },
      { id: 'In Progress', color: '#6fce94' },
      { id: 'Completed', color: '#007C30' },
      { id: 'Closed', color: '#C4071B' }
    ],
    isUpvoted: null,
    isDownvoted: null
  }),
  computed: {
    ...mapState('community', {
      votesInLocalStorage: 'votesInLocalStorage'
    })
  },
  watch: {
    votesInLocalStorage () {
      const isVoteInLocalStorage = this.votesInLocalStorage.find(x => x.id === this.idea.ideasId)
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
    this.isUpvoted = !!(localStorage.getItem(this.idea.ideasId) &&
                localStorage.getItem(this.idea.ideasId).startsWith('1'))
    this.isDownvoted = !!(localStorage.getItem(this.idea.ideasId) &&
               localStorage.getItem(this.idea.ideasId).startsWith('0'))
  },
  methods: {
    upvote () {
      this.$store.dispatch(
        'community/voteIdea',
        {
          ideasId: this.idea.ideasId, vote: 1
        }
      )
    },
    downvote () {
      this.$store.dispatch(
        'community/voteIdea',
        {
          ideasId: this.idea.ideasId, vote: -1
        }
      )
    }
  }
}
</script>

<style scoped>
</style>

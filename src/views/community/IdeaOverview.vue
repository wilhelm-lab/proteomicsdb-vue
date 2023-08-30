<template>
  <v-main>
    <v-container
      fluid
      ml-5
    >
      <v-row
        justify="center"
        class="ma-2"
      >
        <v-col cols="9">
          <idea-search-bar
            :ideas-counter="resultQuery.length"
            :ideas="ideas"
            @searchQueryChanged="newSearchQuery"
            @selectedItemChanged="newSelectedItem"
            @selectedStatus="newSelectedStatus"
          />
        </v-col>
      </v-row>
      <v-row
        justify="center"
        class="ma-2"
      >
        <v-col
          cols="9"
          class="d-flex justify-end"
        >
          <v-btn
            :to="{ name: 'ideaSubmission'}"
            color="primary"
          >
            Submit new idea
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        justify="center"
        class="ma-2"
      >
        <v-col cols="9">
          <div
            v-for="(idea) in resultQuery"
            :key="idea.ideasId"
          >
            <idea-card
              :idea="idea"
              :details="false"
            />
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import { mapState } from 'vuex'
import IdeaCard from '../../components/community/IdeaCard'
import IdeaSearchBar from '../../components/community/IdeaSearchBar'
import _ from 'lodash'

export default {
  name: 'IdeaOverview',
  components: { IdeaSearchBar, IdeaCard },
  data: () => ({
    searchQuery: null,
    selectedItem: null,
    selectedStatus: null
  }),
  computed: {
    ...mapState('community', {
      ideas: 'ideas'
    }),
    /** @returns {{ ideasId: number }[]} */
    resultQuery () {
      if (this.searchQuery && !this.selectedItem && !this.selectedStatus) {
        return this.ideas.filter((item) => {
          return this.searchQuery.toLowerCase().split(' ').every(v => item.ideaTitle.toLowerCase().includes(v))
        })
      } else if (!this.searchQuery && this.selectedItem && !this.selectedStatus) {
        return _.orderBy(this.ideas, [this.selectedItem], ['desc'])
      } else if (!this.searchQuery && !this.selectedItem && this.selectedStatus) {
        return this.ideas.filter((item) => {
          return item.ideaStatus === this.selectedStatus
        })
      } else if (this.searchQuery && this.selectedItem && !this.selectedStatus) {
        return this.ideas.filter((item) => {
          return this.searchQuery.toLowerCase().split(' ').every(v => item.ideaTitle.toLowerCase().includes(v))
        }).sort(this.compareValues(this.selectedItem, 'desc'))
      } else if (this.searchQuery && !this.selectedItem && this.selectedStatus) {
        return this.ideas.filter((item) => {
          return this.searchQuery.toLowerCase().split(' ').every(v => item.ideaTitle.toLowerCase().includes(v))
        }).filter((item) => {
          return item.ideaStatus === this.selectedStatus
        })
      } else if (!this.searchQuery && this.selectedItem && this.selectedStatus) {
        const sortedIdeas = this.ideas
        return sortedIdeas.sort(this.compareValues(this.selectedItem, 'desc')).filter((item) => {
          return item.ideaStatus === this.selectedStatus
        })
      } else if (this.searchQuery && this.selectedItem && this.selectedStatus) {
        return this.ideas.filter((item) => {
          return this.searchQuery.toLowerCase().split(' ').every(v => item.ideaTitle.toLowerCase().includes(v))
        }).sort(this.compareValues(this.selectedItem, 'desc')).filter((item) => {
          return item.ideaStatus === this.selectedStatus
        })
      } else {
        return this.ideas
      }
    }
  },
  mounted () {
    this.$store.dispatch('community/loadIdeas')
  },
  methods: {
    newSearchQuery (val) {
      this.searchQuery = val
    },
    newSelectedItem (val) {
      this.selectedItem = val
    },
    newSelectedStatus (val) {
      this.selectedStatus = val
    },
    compareValues (key, order = 'asc') {
      return function innerSort (a, b) {
        if (!Object.prototype.hasOwnProperty.call(a, key) || !Object.prototype.hasOwnProperty.call(b, key)) {
          // property doesn't exist on either object
          return 0
        }
        const varA = (typeof a[key] === 'string')
          ? a[key].toUpperCase()
          : a[key]
        const varB = (typeof b[key] === 'string')
          ? b[key].toUpperCase()
          : b[key]
        let comparison = 0
        if (varA > varB) {
          comparison = 1
        } else if (varA < varB) {
          comparison = -1
        }
        return (
          (order === 'desc') ? (comparison * -1) : comparison
        )
      }
    }
  }
}
</script>

<style scoped>

</style>

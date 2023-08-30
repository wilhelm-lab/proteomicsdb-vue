<template>
  <v-card elevation="0">
    <v-card-text>
      <v-row
        align="center"
        justify="space-around"
      >
        <v-col
          cols="2"
          class="d-flex justify-center"
        >
          <div class="theme--light--text">
            IDEAS &nbsp;({{ ideasCounter }})
          </div>
        </v-col>
        <v-col cols="5">
          <v-text-field
            v-model="searchQuery"
            background-color="#fff"
            outlined
            prepend-icon="mdi-magnify"
            single-line
            label="Search for Title"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="selectedItem"
            label="Sort By"
            :items="sortItems"
            background-color="#fff"
            outlined
            hide-details
            clearable
          />
        </v-col>
      </v-row>
      <v-row
        align="center"
        justify="space-around"
      >
        <v-col
          v-for="ideaState in ideaStatus"
          :key="ideaState.id"
          class="d-flex justify-center"
        >
          <v-badge
            v-if="totalIdeas(ideaState.id)>0"
            :color="ideaState.color"
            :content="totalIdeas(ideaState.id)"
            overlap
          >
            <v-chip
              v-if="!isActive || ideaState.isFiltered"
              :color="ideaState.color"
              :input-value="ideaState.isFiltered"
              filter
              label
              outlined
              @click="selectedStatus(ideaState.id)"
            >
              {{ ideaState.id }}
            </v-chip>
            <v-chip
              v-else
              :color="ideaState.color"
              label
              outlined
            >
              {{ ideaState.id }}
            </v-chip>
          </v-badge>
          <v-badge
            v-else
            color="grey lighten-1"
            overlap
            dot
          >
            <v-chip
              disabled
              :color="ideaState.color"
              label
              outlined
            >
              {{ ideaState.id }}
            </v-chip>
          </v-badge>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'IdeaSearchBar',
  props: {
    ideasCounter: {
      type: Number,
      default: null
    },
    ideas: {
      type: Array,
      default: null
    }
  },
  data: () => ({
    searchQuery: null,
    sortItems: ['Newest', 'Most Upvoted', 'Most Commented'],
    selectedItem: null,
    isActive: false,
    ideaStatus: [
      { id: 'New', color: '#0065BD', isFiltered: false },
      { id: 'Planned', color: '#6cbbff', isFiltered: false },
      { id: 'In Progress', color: '#6fce94', isFiltered: false },
      { id: 'Completed', color: '#007C30', isFiltered: false },
      { id: 'Closed', color: '#C4071B', isFiltered: false }
    ]
  }),
  watch: {
    searchQuery (val) {
      this.$emit('searchQueryChanged', val)
    },
    selectedItem (val) {
      switch (val) {
        case 'Newest':
          return this.$emit('selectedItemChanged', 'ideaCreatedDate')
        case 'Most Upvoted':
          return this.$emit('selectedItemChanged', 'nrIdeaVotes')
        case 'Most Commented':
          return this.$emit('selectedItemChanged', 'nrIdeaComments')
        default:
          return this.$emit('selectedItemChanged', null)
      }
    }
  },
  methods: {
    totalIdeas (status) {
      const arrIdeaStatus = Object.values(this.ideas).map(x => {
        return x.ideaStatus
      })
      return arrIdeaStatus.filter((x) => {
        return x === status
      }).length
    },
    selectedStatus (val) {
      if (!this.isActive) {
        this.isActive = true
        this.ideaStatus.find(x => x.id === val).isFiltered = true
        switch (val) {
          case 'New':
            return this.$emit('selectedStatus', 'New')
          case 'Planned':
            return this.$emit('selectedStatus', 'Planned')
          case 'In Progress':
            return this.$emit('selectedStatus', 'In Progress')
          case 'Completed':
            return this.$emit('selectedStatus', 'Completed')
          case 'Closed':
            return this.$emit('selectedStatus', 'Closed')
          default:
            return this.$emit('selectedStatus', null)
        }
      } else {
        this.isActive = false
        this.ideaStatus.find(x => x.id === val).isFiltered = false
        return this.$emit('selectedStatus', null)
      }
    }
  }

}
</script>

<style scoped>

</style>

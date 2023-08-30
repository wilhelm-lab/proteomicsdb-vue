<template>
  <div class="search-bar">
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-text-field
          ref="searchInput"
          v-model="searchString"
          :class="{'search-bar-text-input': true, 'search-bar-type-shown': !hideType}"
          :placeholder="placeholderDisplay"
          :outlined="outlined"
          append-icon="search"
          clearable
          hide-details
          solo
          light
          flat
          :dense="dense"
          v-bind="attrs"
          v-on="on"
          @keyup.enter="execSearch"
          @click:append="execSearch"
        >
          <template #prepend>
            <v-select
              v-if="!hideType"
              v-model="searchType"
              :items="searchTypes"
              item-disabled="disabled"
              hide-details
              :outlined="outlined"
              solo
              flat
              :dense="dense"
              class="search-bar-type-select"
            />
          </template>
        </v-text-field>
      </template>
      <span>The search returns only exact matches. You may use an asterisk (*) to match an arbitrary pre- or suffix.</span>
    </v-tooltip>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SearchBar',
  props: {
    value: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'Protein'
    },
    placeholder: {
      type: String,
      default: 'Search for a {}'
    },
    hideType: {
      type: Boolean,
      default: false
    },
    targetTab: {
      type: String,
      default: null
    },
    outlined: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: Number,
      default: -1
    }
  },
  data () {
    return {
      searchString: '',
      searchType: 'Protein'
    }
  },
  computed: {
    ...mapState({
      organismTaxcode: state => state.organismTaxcode
    }),
    /** @returns {{ text: string, disabled: boolean}} */
    searchTypes () {
      return [
        { text: 'Protein', disabled: false },
        { text: 'Peptide (Coming soon)', disabled: true },
        { text: 'Project (Coming soon)', disabled: true },
        { text: 'Drug', disabled: (this.organismTaxcode !== 9606) },
        { text: 'Cell Line (Coming soon)', disabled: true }
      ]
    },
    /** @returns {string} */
    placeholderDisplay () {
      return this.placeholder.replace('{}', this.searchType)
    }
  },
  watch: {
    searchString (newSearchString) {
      this.$emit('update:value', newSearchString)
    },
    searchType (newSearchType) {
      this.$emit('update:type', newSearchType)
    },
    value (value) {
      this.searchString = value
    },
    type: {
      immediate: true,
      handler (type) {
        this.searchType = type
      }
    }
  },
  methods: {
    focus () {
      this.$nextTick(() => this.$refs.searchInput.focus())
    },
    execSearch () {
      const query = {
        q: this.searchString,
        type: this.searchType,
        projectId: this.projectId
      }

      if (this.targetTab) {
        query.targetTab = this.targetTab
      }

      this.$router
        .push(
          {
            name: 'genericSearch',
            query
          })
    }
  }
}
</script>

<style lang="scss">
.search-bar {
  width: 100%;

  .search-bar-text-input {
    &.v-input .v-input__prepend-outer {
      margin-left: 0 !important;
      margin-top: 0 !important;
      margin-right: 0 !important;
      margin-bottom: 0 !important;
    }

    &.search-bar-outlined {

      .search-bar-type-select {
        border-right: none;
      }
    }

    &.search-bar-type-shown {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

  .search-bar-type-select {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
}

</style>

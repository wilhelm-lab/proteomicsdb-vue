
<template>
  <div class="wrapper-left-navigation">
    <v-navigation-drawer
      v-if="$vuetify.breakpoint.mdAndUp"
      :width="width"
      permanent
      clipped
      app
      class="d-flex flex-column"
    >
      <div class="wrapper-left-navigation__content d-flex flex-column">
        <div class="wrapper-left-navigation-header">
          <slot name="header" />
        </div>
        <wrapper-left-navigation-list :items="items" />
      </div>
    </v-navigation-drawer>
    <v-container v-else>
      <div class="wrapper-left-navigation-header-mobile mb-6">
        <slot name="header" />
      </div>
      <v-menu>
        <template #activator="{ on, attrs }">
          <v-btn
            class="mobile-navigation-button justify-start"
            v-bind="attrs"
            solo
            color="white"
            block
            large
            v-on="on"
          >
            <v-icon
              left
            >
              mdi-menu
            </v-icon>
            {{ activeLabel }}
            <v-spacer />
            <v-icon
              right
            >
              mdi-chevron-down
            </v-icon>
          </v-btn>
        </template>
        <v-toolbar
          elevation="0"
          dense
          class="d-flex align-center justify-end"
        >
          <v-btn
            icon
            @click="showMobileMenu = false"
          >
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
        </v-toolbar>
        <wrapper-left-navigation-list
          class="wrapper-left-navigation-list-mobile"
          :items="items"
        />
      </v-menu>
    </v-container>
  </div>
</template>

<script>
import WrapperLeftNavigationList from './WrapperLeftNavigationList.vue'

export default {
  components: {
    WrapperLeftNavigationList
  },
  props: {
    width: {
      default: 300,
      type: Number
    },
    items: {
      default: () => [],
      type: Array
    }
  },
  data: () => ({
    showMobileMenu: false
  }),
  computed: {
    /** @returns {Array} */
    subItems () {
      return this.items.reduce((acc, item) => {
        if (item.submodules) {
          acc.push(...item.submodules)
        }
        return acc
      }, [])
    },
    /** @returns {Object} */
    activeItem () {
      return this.items.find(item => item.routeName === this.$route.name) ||
        this.subItems.find(item => item.routeName === this.$route.name)
    },
    /** @returns {Object} */
    activeSubItemParent () {
      return this.items.find(item => item.submodules && item.submodules.includes(this.activeItem))
    },
    /** @returns {string} */
    activeLabel () {
      return this.activeSubItemParent
        ? `${this.activeSubItemParent.label}: ${this.activeItem.label}`
        : this.activeItem?.label
    }
  }
}
</script>

<style lang="scss">
.wrapper-left-navigation {
  .wrapper-left-navigation-header {
    padding: 1em;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);

    h1 {
      font-size: 1.25em;
    }
  }

  .v-navigation-drawer__content {
    overflow-y: hidden;
  }

  .wrapper-left-navigation-list {
    overflow-y: auto;
  }

  .wrapper-left-navigation__content {
    height: 100%;
  }

  .mobile-navigation-button {
    text-transform: none;

    .v-btn__content {
      font-size: 1.25em;
      justify-content: start;
    }
  }

}

.wrapper-left-navigation-list-mobile {
  max-height: 80vh;
  overflow-y: auto;
}
</style>

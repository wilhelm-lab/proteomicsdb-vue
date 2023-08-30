<template>
  <v-card
    flat
    class="d-flex"
    :class="$vuetify.breakpoint.smAndUp ? 'flex-row' : 'flex-column'"
  >
    <v-avatar
      class="ma-3 elevation-2"
      size="120"
    >
      <v-img
        v-if="avatar !== ''"
        :src="require(`@/assets/people/${avatar}`)"
      />
      <v-img
        v-else
        :src="require(`@/assets/commons/unknown.png`)"
      />
    </v-avatar>

    <div>
      <v-card-title
        class="headline"
      >
        {{ name }}
        <a
          v-for="(icon, i) in social"
          :key="i"
          :href="icon.link"
          target="_blank"
          class="team-card-social-icon"
        >
          <v-tooltip top>
            <template #activator="{ on }">
              <v-icon
                class="mx-1"
                v-on="on"
              >
                {{
                  icon.icon
                }}
              </v-icon>
            </template>
            <span>{{ icon.social }}</span>
          </v-tooltip>
        </a>
      </v-card-title>

      <v-card-subtitle class="pb-0">
        FOCUS - {{ focus }}
      </v-card-subtitle>

      <v-list
        dense
        class="py-0"
      >
        <v-list-item>
          <v-list-item-icon>
            <v-icon> mdi-briefcase </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ role }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="affiliation">
          <v-list-item-icon>
            <v-icon> mdi-home </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ affiliation }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="position">
          <v-list-item-icon>
            <v-icon> mdi-account </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ position }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>

<script>
export default {
  components: {},
  props: {
    avatar: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      default: ''
    },
    affiliation: {
      type: String,
      default: ''
    },
    position: {
      type: String,
      default: ''
    },
    focus: {
      type: String,
      default: ''
    },
    social: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.team-card-social-icon {
  text-decoration: none;
}
</style>

<template>
  <v-list
    shaped
    class="wrapper-left-navigation-list"
  >
    <v-list-item-group
      mandatory
    >
      <template
        v-for="(item, index) in items"
      >
        <v-list-group
          v-if="(typeof item.submodules !== 'undefined')"
          :key="index"
          :value="true"
          no-action
        >
          <template #activator>
            <v-list-item-content>
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            v-for="(subitem, subindex) in [...item.submodules]"
            :key="index + '-' + subindex"
            :to="{name: subitem.routeName}"
            :disabled="shouldtemDisable(subitem)"
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ subitem.label }}
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-chip
                v-if="subitem.showDataCount"
                :loading="subitem.loading"
                :disabled="shouldtemDisable(subitem)"
                pill
                small
              >
                <v-progress-circular
                  v-if="subitem.loading"
                  size="14"
                  width="1"
                  indeterminate
                />
                <span v-else>
                  {{ subitem.dataCount }}
                </span>
              </v-chip>
            </v-list-item-action>
          </v-list-item>
        </v-list-group>
        <v-list-item
          v-else
          :key="index"
          :to="{name: item.routeName}"
          :disabled="shouldtemDisable(item)"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ item.label }}
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action>
            <v-chip
              v-if="item.showDataCount"
              :loading="item.loading"
              :disabled="shouldtemDisable(item)"
              pill
              small
            >
              <v-progress-circular
                v-if="item.loading"
                size="14"
                width="1"
                indeterminate
              />
              <span v-else>
                {{ item.dataCount }}
              </span>
            </v-chip>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list-item-group>
  </v-list>
</template>

<script>
export default {
  props: {
    items: {
      default: () => [],
      type: Array
    }
  },
  methods: {
    shouldtemDisable (item) {
      return item.loading || (item.showDataCount && item.dataCount === 0) || item.disabled
    }
  }
}
</script>

<style lang="scss">
.wrapper-left-navigation-list {
  padding-top: 0;
}
</style>

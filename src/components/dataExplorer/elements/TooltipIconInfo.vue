<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-icon
        v-bind="attrs"
        :class="typeof classIcon !== 'undefined' ? '' : 'info-icon'"
        :color="color"
        small
        v-on="on"
      >
        info
      </v-icon>
    </template>
    <span v-html="tooltipText" />
  </v-tooltip>
</template>

<script>
export default {
  name: 'TooltipIconInfo',
  components: {},
  props: {
    tooltipText: {
      type: String,
      default () {
        return ''
      }
    },
    color: {
      type: String,
      default () {
        return ''
      }
    },
    classIcon: {
      type: String,
      default () {
        return ''
      }
    }
  }
}
</script>

<style scoped>
</style>

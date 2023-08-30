<template>
  <v-autocomplete
    multiple
    :items="items"
    :value="value"
    :outlined="outlined"
    :item-text="itemText"
    :item-value="itemValue"
    :return-object="returnObject"
    :label="label"
    :small-chips="smallChips"
    @input="onInput"
    @change="onChange"
  >
    <template #prepend-item>
      <slot name="prepend-item">
        <v-list-item
          ripple
          @mousedown.prevent
          @click="selectAllToggle"
        >
          <v-list-item-action>
            <v-icon :color="selectAllIconColor">
              {{ selectAllIcon }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              {{ selectAllText }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="mt-2" />
      </slot>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  props: {
    value: {
      type: Array,
      default: () => []
    },
    items: {
      type: Array,
      default: () => []
    },
    selectAllText: {
      type: String,
      default: 'Select All'
    },
    outlined: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    itemText: {
      type: String,
      default: 'text'
    },
    itemValue: {
      type: String,
      default: 'value'
    },
    smallChips: {
      type: Boolean,
      default: false
    },
    returnObject: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** @returns {boolean} */
    isAllSelected () {
      return this.value.length === this.items.length
    },
    /** @returns {boolean} */
    isSomeSelected () {
      return this.value.length > 0 && !this.isAllSelected
    },
    /** @returns {string} */
    selectAllIcon () {
      if (this.isAllSelected) return 'mdi-close-box'
      if (this.isSomeSelected) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
    /** @returns {string} */
    selectAllIconColor () {
      return this.value.length > 0 ? 'primary' : ''
    }
  },
  methods: {
    selectAllToggle () {
      if (this.isAllSelected) {
        this.$emit('input', [])
      } else {
        if (this.returnObject) {
          this.$emit('input', this.items)
        } else {
          this.$emit('input', this.items.map(item => item[this.itemValue]))
        }
      }
    },
    onInput (value) {
      this.$emit('input', value)
    },
    onChange (value) {
      this.$emit('change', value)
    }
  }
}
</script>

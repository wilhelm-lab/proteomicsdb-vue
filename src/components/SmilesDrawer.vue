<template>
  <div
    ref="container"
    class="smiles-drawer-container"
  >
    <canvas
      v-if="showCanvas"
      :id="id"
      ref="canvas"
      class="smiles-drawer-canvas"
    />
  </div>
</template>
<script>
import { v4 as uuidv4 } from 'uuid'
import SmilesDrawer from 'smiles-drawer'

export default {
  props: {
    smiles: {
      default: '',
      type: String
    }
  },
  data: () => ({
    id: 'smiles-drawer-' + uuidv4(),
    showCanvas: true,
    resizeObserver: {}
  }),
  watch: {
    smiles () {
      this.draw()
    }
  },
  mounted () {
    this.draw()
  },
  methods: {
    draw () {
      const smilesDrawer = new SmilesDrawer.Drawer({})
      SmilesDrawer.parse(
        this.smiles,
        parsedSmiles => smilesDrawer.draw(parsedSmiles, this.id),
        // eslint-disable-next-line no-console
        error => console.log(error) // logging explicitly here because SmilesDrawer otherwise fails silently
      )

      // remove fixed width and height added by SmilesDrawer which prevent it from resizing
      this.$refs.canvas.removeAttribute('style')
    }
  }
}
</script>

<style lang="scss" scoped>
.smiles-drawer-canvas {
  width: 100%;
}
</style>

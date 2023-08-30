<template>
  <div>
    <span v-if="isPrivate">nondisclosure</span>

    <div
      v-else
      class="project-links"
    >
      <router-link
        v-if="projectId"
        :to="{ name: 'project', params: { projectId } }"
      >
        {{ projectName }}
      </router-link>
      <router-link
        v-if="projectId && experimentId"
        :to="{ name: 'projectExperiment', params: { projectId, experimentId } }"
      >
        {{ experimentName }}
      </router-link>
      <router-link
        v-if="projectId && experimentId && designId"
        :to="{
          name: 'projectExperimentDesign', params: {
            projectId,
            experimentId,
            expDesignId: designId
          }
        }"
      >
        {{ designName }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    private: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: String,
      default: ''
    },
    experimentId: {
      type: String,
      default: ''
    },
    designId: {
      type: String,
      default: ''
    },
    projectName: {
      type: String,
      default: ''
    },
    experimentName: {
      type: String,
      default: ''
    },
    designName: {
      type: String,
      default: ''
    }
  },
  computed: {
    /** @returns {boolean} */
    isPrivate () {
      return this.private ||
        this.projectName === 'private' ||
        this.projectName === 'nondisclosure'
    }
  }
}
</script>

<style scoped>
.project-links {
  display: flex;
  flex-direction: column;
}
</style>

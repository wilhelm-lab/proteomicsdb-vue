<template>
  <v-expansion-panels class="mb-3">
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div class="caption text--primary d-flex align-center">
          <v-icon>
            mdi mdi-reply
          </v-icon>
          <div class="pl-2">
            View All Replies
          </div>
        </div>
      </v-expansion-panel-header>
      <div
        v-for="commentReply in commentReplies"
        :key="commentReply.commentId"
      >
        <v-expansion-panel-content class="body-2 text--secondary pl-2">
          <v-divider class="pb-2" />
          <div class="d-flex align-center caption text--primary">
            {{ commentReply.username }} &nbsp;replied on &nbsp;{{ new Date(commentReply.commentCreatedDate).toLocaleString('de-DE', {timeZone: 'UTC'}) }}
          </div>
          <div class="pt-2">
            {{ commentReply.commentText }}
          </div>
        </v-expansion-panel-content>
      </div>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  name: 'CommentReplyCard',
  props: {
    commentReplies: {
      type: Object,
      default: null
    }
  }
}
</script>

<style scoped>

</style>

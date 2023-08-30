<template>
  <v-list
    two-line
    class="pa-0 rounded"
  >
    <template v-for="(item, index) in news">
      <v-divider
        v-if="index > 0"
        :key="`d-${index}`"
      />
      <v-list-item
        :key="`l-${index}`"
        three-line
        @click="openNews(index)"
      >
        <v-list-item-content>
          <!-- eslint-disable vue/no-v-html -->
          <v-list-item-subtitle
            v-html="$sanitizeHtml(item.NEWS_DATE)"
          />
          <v-list-item-title
            v-html="$sanitizeHtml(item.SHORT_TITLE)"
          />
          <v-list-item-subtitle
            v-html="$sanitizeHtml(item.SHORT_TEXT)"
          />
          <!-- eslint-enable vue/no-v-html -->
        </v-list-item-content>

        <v-list-item-action>
          <v-btn
            elevation="0"
            @click="openNews(index)"
          >
            Read more
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </template>

    <v-dialog
      v-model="showDetailedNews"
    >
      <v-card v-if="detailedNewsItem">
        <v-card-title class="d-flex flex-column align-start justify-center">
          <v-btn
            icon
            class="align-self-end mb-n8"
            @click="showDetailedNews = false"
          >
            <v-icon>
              mdi-close
            </v-icon>
          </v-btn>
          <h3 class="text-h5">
            {{ detailedNewsItem.TITLE }}
          </h3>
          <div class="text-subtitle-1">
            {{ detailedNewsItem.NEWS_DATE }}
          </div>
        </v-card-title>

        <v-divider class="mb-4" />

        <!-- eslint-disable vue/no-v-html -->
        <v-card-text
          v-html="$sanitizeHtml(detailedNewsItem.TEXT)"
        />
        <!-- eslint-enable vue/no-v-html -->
      </v-card>
    </v-dialog>
  </v-list>
</template>

<script>
import axios from 'axios'

export default {
  data: () => ({
    news: [],
    showDetailedNews: false,
    detailedNewsItemIndex: -1
  }),
  computed: {
    /** @returns {any} */
    detailedNewsItem () {
      if (this.detailedNewsItemIndex === -1) {
        return null
      }

      return this.news[this.detailedNewsItemIndex]
    }
  },
  created () {
    this.fetchNews()
  },
  methods: {
    openNews (index) {
      this.detailedNewsItemIndex = index
      this.showDetailedNews = true
    },
    async fetchNews () {
      const response = await axios
        .get(this.$store.state.host + '/proteomicsdb/logic/getNews.xsjs', {
          params: { top: 5 }
        })

      this.news = response.data.allNews
    }
  }
}
</script>

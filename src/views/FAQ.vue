<template>
  <v-main>
    <v-container>
      <v-card elevation="0">
        <v-card-title>
          <h1 class="text-h4">
            Frequently asked questions about Proteomics DB
          </h1>
        </v-card-title>

        <v-card-text>
          <v-list
            dense
          >
            <template v-for="item in [...faqs]">
              <v-list-item :key="`${item.category}-item`" />
              <h3 :key="`${item.category}-category`">
                {{ item.category }}
              </h3>
              <v-expansion-panels
                :key="`${item.category}-expansion-panels`"
              >
                <v-expansion-panel
                  v-for="(qanda, index) in [...item.qandas]"
                  :key="`${item.category}-expansion-panel-${index}`"
                >
                  <v-expansion-panel-header class="question">
                    {{
                      qanda.question
                    }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="text-left answer">
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <span v-html="$sanitizeHtml(qanda.answer)" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </template>
          </v-list>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
import faqs from '@/assets/json/faq.json'

export default {
  name: 'FAQVue',
  components: {},
  data: () => ({
    faqs
  })
}
</script>

<style scoped lang="scss">
h3 {
  font-size: 14pt;
  margin-left: 10px;
  margin-bottom: 10px;
}

.question {
  font-size: 12pt;
}

.answer {
  font-size: 11pt;
}
</style>

import Vue from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    $sanitizeHtml: (html: string) => string;
  }
}

declare module '*.vue' {
  import  "vuetify"
}
<template>
  <v-main>
    <div id="questionmark">
      ?
    </div>
    <h1>Error 404 - Not Found</h1>
    <p>
      The page you're trying to access does not exist. <br>
      It might be misspelled or currently unavailable. <br>
      <strong>Please check the URL or try again later. <br> </strong>
    </p>
  </v-main>
</template>

<script>
export default {
  name: 'NotFoundVue',
  mounted () {
    // Explicitly handle 404 tracking for matomo
    if (window._paq) {
      window._paq.push(['setDocumentTitle', '404' +
      ' URL=' +
      encodeURIComponent(document.location.pathname + document.location.search) +
      ' From=' +
      encodeURIComponent(document.referrer)])
      window._paq.push(['trackPageView'])
    }
  }
}
</script>

<style scoped lang="scss">
h1 {
  text-align: center;
  font-size: 30pt;
}
p {
  text-align: center;
  font-size: 16pt;
}
div {
  text-align: center;
}
#questionmark {
  font-size: 200px;
  color: rgba(0, 0, 0, 0.5);
}
</style>

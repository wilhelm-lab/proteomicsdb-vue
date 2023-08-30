import xss from 'xss'

const install = (Vue) => {
  Vue.mixin({
    methods: {
      $sanitizeHtml: xss
    }
  })
}

export default {
  install
}

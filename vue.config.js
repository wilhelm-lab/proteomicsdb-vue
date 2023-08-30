module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'ProteomicsDB'
        return args
      })

    config.module
      .rule('css-for-svgs')
      .test(/\.css.prdb$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'css/[name].[contenthash].css',
        esModule: false
      })
      .end()

    if (process.env.NODE_ENV === 'development') {
      // Babel messes up the source maps so we disable it for development.
      // Note that Babel is still used for production builds and might be a potential
      // source of slight differences between development and production builds.
      // Unless there is a bug in Babel (unlikely) that should not be a problem.
      config.module
        .rule('js')
        .uses
        .delete('babel-loader')

      // enable source maps in development
      config.devtool('source-map')
    }
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.txt$/,
          type: 'asset/source'
        },
        {
          test: /bodyMap\/.*?\.svg$/,
          type: 'asset/source'
        }
      ]
    },
    cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
      buildDependencies: {
        config: [__filename]
      }
    }
  },
  publicPath: process.env.VUE_APP_ROUTER_BASE,
  lintOnSave: false
}

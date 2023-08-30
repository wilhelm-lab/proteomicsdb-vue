module.exports = {
  root: true,
  ignorePatterns: [
    'packages',
    'src/vue-d3-component-wrappers',
    'src/vue-d3-components',
    'src/components/dataExplorer'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  overrides: [
    {
      files: '**/*.+(js|vue|jsx)',
      extends: [
        'standard',
        'eslint:recommended',
        'plugin:vue/recommended'
      ],
      rules: {
        'no-console': 'warn',
        // TODO: refactor so this can be turned on
        'vue/multi-word-component-names': 'off',
        // Currently no way around this with help html
        // Make sure to always use `$sanitizeHtml(html)` when using `v-html`
        'vue/no-v-text-v-html-on-component': 'off'
      }
    },
    {
      files: ['*.(ts|tsx)'],
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended']
    }
  ]
}

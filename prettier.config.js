/**
 * Prettier configuration for Nuxt 4 + Tailwind v4 project
 * - Keep printWidth moderate to reduce wrap churn in Vue SFC templates
 * - Ensure plugin-order works well with Tailwind class sorting handled elsewhere if needed
 */

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'es5',
  tabWidth: 2,
  vueIndentScriptAndStyle: false,
  singleAttributePerLine: false,
  htmlWhitespaceSensitivity: 'ignore',
  endOfLine: 'auto',
  overrides: [
    {
      files: ['*.yml', '*.yaml'],
      options: { singleQuote: false },
    },
    {
      files: ['*.md'],
      options: { proseWrap: 'always' },
    },
  ],
}

export default config

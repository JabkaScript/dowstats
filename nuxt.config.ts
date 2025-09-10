// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],
  runtimeConfig: {
    public: {
      dbHost: process.env.NUXT_DB_HOST,
      dbPort: process.env.NUXT_DB_PORT,
      dbUser: process.env.NUXT_DB_USER,
      dbPassword: process.env.NUXT_DB_PASSWORD,
      dbName: process.env.NUXT_DB_NAME,
    },
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    langDir: 'locales',
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json' },
      { code: 'ru', language: 'ru-RU', file: 'ru.json' },
    ],
    defaultLocale: 'en',
  },
  routeRules: {
    '/': { swr: true },
    // '/relic-ladder': { isr: 3600 },
  },
})

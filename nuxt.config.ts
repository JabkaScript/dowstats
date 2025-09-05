

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/ui'
  ],
  runtimeConfig: {
    public: {
      dbHost: process.env.NUXT_DB_HOST,
      dbPort: process.env.NUXT_DB_PORT,
      dbUser: process.env.NUXT_DB_USER,
      dbPassword: process.env.NUXT_DB_PASSWORD,
      dbName: process.env.NUXT_DB_NAME,
    }
  },

  css: ['~/assets/css/main.css'],
  ui: {
    prefix: 'Nuxt'
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en-US' },
      { code: 'ru', language: 'ru-RU' }
    ],
    defaultLocale: 'en',
  },
  nitro: {
    experimental: {
      openAPI: true
    },
    openAPI: {
      production: 'prerender',
      route: "/docs"
    }
  },
})
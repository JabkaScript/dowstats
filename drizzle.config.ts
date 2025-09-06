import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  schema: 'server/database/schema.ts',
  out: 'server/database',
  dialect: 'mysql',
  dbCredentials: {
    host:  process.env.NUXT_DB_HOST || process.env.NUXT_PUBLIC_DB_HOST!,
    port: Number(process.env.NUXT_DB_PORT || process.env.NUXT_PUBLIC_DB_PORT) || 3306,
    user: process.env.NUXT_DB_USER || process.env.NUXT_PUBLIC_DB_USER!,
    password: process.env.NUXT_DB_PASSWORD || process.env.NUXT_PUBLIC_DB_PASSWORD!,
    database: process.env.NUXT_DB_NAME || process.env.NUXT_PUBLIC_DB_NAME!,
  },
})

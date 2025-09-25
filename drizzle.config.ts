import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  schema: 'server/database/schema.ts',
  out: 'server/database',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.NUXT_DB_HOST!,
    port: Number(process.env.NUXT_DB_PORT) || 3306,
    user: process.env.NUXT_DB_USER!,
    password: `${process.env.NUXT_DB_PASSWORD!}`,
    database: process.env.NUXT_DB_NAME!,
  },
})

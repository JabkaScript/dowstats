import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './database/schema'

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.NUXT_DB_HOST || process.env.NUXT_PUBLIC_DB_HOST,
  user: process.env.DB_USER || process.env.NUXT_DB_USER || process.env.NUXT_PUBLIC_DB_USER,
  password: process.env.DB_PASSWORD || process.env.NUXT_DB_PASSWORD || process.env.NUXT_PUBLIC_DB_PASSWORD,
  database: process.env.DB_NAME || process.env.NUXT_DB_NAME || process.env.NUXT_PUBLIC_DB_NAME,
  port: Number(process.env.DB_PORT || process.env.NUXT_DB_PORT || process.env.NUXT_PUBLIC_DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const db = drizzle(pool, { schema, mode: 'default' })

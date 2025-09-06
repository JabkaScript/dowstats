import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './database/schema'

const config = useRuntimeConfig()
const pool = mysql.createPool({
  host:  config.public.dbHost,
  user: config.public.dbUser,
  password: config.public.dbPassword,
  database: config.public.dbName,
  port: Number(config.public.dbPort),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const db = drizzle(pool, { schema, mode: 'default' })

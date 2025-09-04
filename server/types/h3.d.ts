// types/h3.d.ts
import type { Pool } from 'mysql2/promise'

declare module 'h3' {
  interface H3EventContext {
    db: Pool
  }
}

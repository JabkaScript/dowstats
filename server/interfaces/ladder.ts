import type { SQL } from 'drizzle-orm'

// Drizzle boolean expression used in WHERE/AND conditions
export type WhereCondition = SQL

// Query params for /api/v1/ladder
export interface LadderQuery {
  mod?: string
  season?: string
  mmrType?: 'solo' | 'team'
  search?: string
  sort?: 'asc' | 'desc'
  // Новый фильтр по серверу (id из таблицы servers)
  server?: string
  // Пагинация
  page?: string
  pageSize?: string
}
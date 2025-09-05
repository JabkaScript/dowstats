import { sql, eq, desc } from 'drizzle-orm'
import { createError } from 'h3'
import type { LadderQuery, WhereCondition } from '~~/server/interfaces/ladder'
import { tables } from './drizzle'
import type { useDrizzle } from './drizzle'

export type DB = ReturnType<typeof useDrizzle>

export function parseModId(query: Partial<LadderQuery>): number {
  const modId = Number(query.mod)
  if (!modId || Number.isNaN(modId)) {
    throw createError({ statusCode: 400, statusMessage: 'Query parameter "mod" (mod_id) is required and must be an integer.' })
  }
  return modId
}

export function parseMmrType(query: Partial<LadderQuery>): 'solo' | 'team' {
  const mmrType = (query.mmrType || 'solo').toLowerCase() as 'solo' | 'team'
  if (mmrType !== 'solo' && mmrType !== 'team') {
    throw createError({ statusCode: 400, statusMessage: "Parameter 'mmrType' must be 'solo' or 'team'." })
  }
  return mmrType
}

export function parseSort(query: Partial<LadderQuery>): 'asc' | 'desc' {
  return (query.sort || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'
}

export function parseServerId(query: Partial<LadderQuery>): number | undefined {
  const serverId = query.server ? Number(query.server) : undefined
  if (serverId !== undefined && (Number.isNaN(serverId) || serverId <= 0)) {
    throw createError({ statusCode: 400, statusMessage: "Parameter 'server' must be a positive integer." })
  }
  return serverId
}

export function parsePagination(query: Partial<LadderQuery>): { page: number; pageSize: number; offset: number } {
  const page = Math.max(1, Number(query.page) || 1)
  let pageSize = Number(query.pageSize) || 25
  if (Number.isNaN(pageSize) || pageSize <= 0) pageSize = 25
  pageSize = Math.min(Math.max(pageSize, 1), 200)
  const offset = (page - 1) * pageSize
  return { page, pageSize, offset }
}

export function parseMinGames(query: Partial<LadderQuery>): number {
  let minGames = 1
  if (query.minGames !== undefined) {
    const parsed = Number(query.minGames)
    minGames = Number.isNaN(parsed) ? 1 : Math.max(0, parsed)
  }
  return minGames
}

export function parseProvidedSeason(query: Partial<LadderQuery>): number | undefined {
  const providedSeason = query.season ? Number(query.season) : undefined
  if (providedSeason !== undefined && (Number.isNaN(providedSeason) || providedSeason <= 0)) {
    throw createError({ statusCode: 400, statusMessage: "Parameter 'season' must be a positive integer." })
  }
  return providedSeason
}

export function buildSearchCondition(search: string): WhereCondition | undefined {
  const s = search.toString().trim().toLowerCase()
  if (s.length === 0) return undefined
  const pattern = `%${s}%`
  return sql`(LOWER(${tables.players.name}) LIKE ${pattern} OR LOWER(${tables.players.lastNicknames}) LIKE ${pattern})` as unknown as WhereCondition
}

export function getTotalGamesExpr(mmrType: 'solo' | 'team') {
  const soloGamesSum = sql<number>`
    COALESCE(${tables.playersStats['1X11']}, 0) + COALESCE(${tables.playersStats['1X12']}, 0) + COALESCE(${tables.playersStats['1X13']}, 0) +
    COALESCE(${tables.playersStats['1X14']}, 0) + COALESCE(${tables.playersStats['1X15']}, 0) + COALESCE(${tables.playersStats['1X16']}, 0) +
    COALESCE(${tables.playersStats['1X17']}, 0) + COALESCE(${tables.playersStats['1X18']}, 0) + COALESCE(${tables.playersStats['1X19']}, 0)
  `
  const teamGamesSum = sql<number>`
    COALESCE(${tables.playersStats['2X21']}, 0) + COALESCE(${tables.playersStats['2X22']}, 0) + COALESCE(${tables.playersStats['2X23']}, 0) +
    COALESCE(${tables.playersStats['2X24']}, 0) + COALESCE(${tables.playersStats['2X25']}, 0) + COALESCE(${tables.playersStats['2X26']}, 0) +
    COALESCE(${tables.playersStats['2X27']}, 0) + COALESCE(${tables.playersStats['2X28']}, 0) + COALESCE(${tables.playersStats['2X29']}, 0) +
    COALESCE(${tables.playersStats['3X31']}, 0) + COALESCE(${tables.playersStats['3X32']}, 0) + COALESCE(${tables.playersStats['3X33']}, 0) +
    COALESCE(${tables.playersStats['3X34']}, 0) + COALESCE(${tables.playersStats['3X35']}, 0) + COALESCE(${tables.playersStats['3X36']}, 0) +
    COALESCE(${tables.playersStats['3X37']}, 0) + COALESCE(${tables.playersStats['3X38']}, 0) + COALESCE(${tables.playersStats['3X39']}, 0) +
    COALESCE(${tables.playersStats['4X41']}, 0) + COALESCE(${tables.playersStats['4X42']}, 0) + COALESCE(${tables.playersStats['4X43']}, 0) +
    COALESCE(${tables.playersStats['4X44']}, 0) + COALESCE(${tables.playersStats['4X45']}, 0) + COALESCE(${tables.playersStats['4X46']}, 0) +
    COALESCE(${tables.playersStats['4X47']}, 0) + COALESCE(${tables.playersStats['4X48']}, 0) + COALESCE(${tables.playersStats['4X49']}, 0)
  `
  return mmrType === 'solo' ? soloGamesSum : teamGamesSum
}

export function getTotalWinsExpr(mmrType: 'solo' | 'team') {
  const soloWinsSum = sql<number>`
    COALESCE(${tables.playersStats['1X11W']}, 0) + COALESCE(${tables.playersStats['1X12W']}, 0) + COALESCE(${tables.playersStats['1X13W']}, 0) +
    COALESCE(${tables.playersStats['1X14W']}, 0) + COALESCE(${tables.playersStats['1X15W']}, 0) + COALESCE(${tables.playersStats['1X16W']}, 0) +
    COALESCE(${tables.playersStats['1X17W']}, 0) + COALESCE(${tables.playersStats['1X18W']}, 0) + COALESCE(${tables.playersStats['1X19W']}, 0)
  `
  const teamWinsSum = sql<number>`
    COALESCE(${tables.playersStats['2X21W']}, 0) + COALESCE(${tables.playersStats['2X22W']}, 0) + COALESCE(${tables.playersStats['2X23W']}, 0) +
    COALESCE(${tables.playersStats['2X24W']}, 0) + COALESCE(${tables.playersStats['2X25W']}, 0) + COALESCE(${tables.playersStats['2X26W']}, 0) +
    COALESCE(${tables.playersStats['2X27W']}, 0) + COALESCE(${tables.playersStats['2X28W']}, 0) + COALESCE(${tables.playersStats['2X29W']}, 0) +
    COALESCE(${tables.playersStats['3X31W']}, 0) + COALESCE(${tables.playersStats['3X32W']}, 0) + COALESCE(${tables.playersStats['3X33W']}, 0) +
    COALESCE(${tables.playersStats['3X34W']}, 0) + COALESCE(${tables.playersStats['3X35W']}, 0) + COALESCE(${tables.playersStats['3X36W']}, 0) +
    COALESCE(${tables.playersStats['3X37W']}, 0) + COALESCE(${tables.playersStats['3X38W']}, 0) + COALESCE(${tables.playersStats['3X39W']}, 0) +
    COALESCE(${tables.playersStats['4X41W']}, 0) + COALESCE(${tables.playersStats['4X42W']}, 0) + COALESCE(${tables.playersStats['4X43W']}, 0) +
    COALESCE(${tables.playersStats['4X44W']}, 0) + COALESCE(${tables.playersStats['4X45W']}, 0) + COALESCE(${tables.playersStats['4X46W']}, 0) +
    COALESCE(${tables.playersStats['4X47W']}, 0) + COALESCE(${tables.playersStats['4X48W']}, 0) + COALESCE(${tables.playersStats['4X49W']}, 0)
  `
  return mmrType === 'solo' ? soloWinsSum : teamWinsSum
}

export async function resolveSeasonId(db: DB, providedSeason?: number): Promise<number | null> {
  if (providedSeason) {
    const seasonExists = await db
      .select({ id: tables.seasons.id })
      .from(tables.seasons)
      .where(eq(tables.seasons.id, providedSeason))
      .limit(1)

    const id = seasonExists[0]?.id
    return id ?? null
  }

  // active first
  const activeSeason = await db
    .select({ id: tables.seasons.id })
    .from(tables.seasons)
    .where(eq(tables.seasons.isActive, 1))
    .orderBy(desc(tables.seasons.id))
    .limit(1)

  let seasonId = activeSeason[0]?.id
  if (!seasonId) {
    const latestSeason = await db
      .select({ id: tables.seasons.id })
      .from(tables.seasons)
      .orderBy(desc(tables.seasons.id))
      .limit(1)
    seasonId = latestSeason[0]?.id
  }

  return seasonId ?? null
}
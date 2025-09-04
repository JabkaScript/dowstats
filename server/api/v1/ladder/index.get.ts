
import { desc, asc, sql, and, eq } from 'drizzle-orm'
import type { LadderQuery, WhereCondition } from '~~/server/interfaces/ladder'

defineRouteMeta({
  openAPI: {
    description: 'Players ladder by MMR with support for name search, mod and rating type (solo/team) selection, sorting, server filter, and pagination.',
    parameters: [
      { in: 'query', name: 'mod', required: true, description: 'Mod ID (mod_id) used to build the ladder', schema: { type: 'integer' } },
      { in: 'query', name: 'season', required: false, description: 'Explicit season ID. If not provided — the active season is used, otherwise — the latest available.', schema: { type: 'integer' } },
      { in: 'query', name: 'mmrType', required: false, description: "Rating type: 'solo' or 'team' (default 'solo')", schema: { type: 'string', enum: ['solo', 'team'] } },
      { in: 'query', name: 'search', required: false, description: 'Search by player name or their recent nicknames', schema: { type: 'string' } },
      { in: 'query', name: 'sort', required: false, description: "Sort direction by MMR: 'desc' (default) or 'asc'", schema: { type: 'string', enum: ['asc', 'desc'] } },
      { in: 'query', name: 'server', required: false, description: 'Server ID (steam/dowonline)', schema: { type: 'integer' } },
      { in: 'query', name: 'page', required: false, description: 'Page number (>=1)', schema: { type: 'integer' } },
      { in: 'query', name: 'pageSize', required: false, description: 'Page size (1..200)', schema: { type: 'integer' } },
    ],
  },
})

export default defineEventHandler(async (event) => {
  const db = useDrizzle()

  const query = getQuery(event) as Partial<LadderQuery>

  // Validate & parse params
  const modId = Number(query.mod)
  if (!modId || Number.isNaN(modId)) {
    throw createError({ statusCode: 400, statusMessage: 'Query parameter "mod" (mod_id) is required and must be an integer.' })
  }

  const mmrType = (query.mmrType || 'solo').toLowerCase() as 'solo' | 'team'
  if (mmrType !== 'solo' && mmrType !== 'team') {
    throw createError({ statusCode: 400, statusMessage: "Parameter 'mmrType' must be 'solo' or 'team'." })
  }

  const sortDir: 'asc' | 'desc' = (query.sort || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'
  const search = (query.search || '').toString().trim().toLowerCase()

  // Server filter
  const serverId = query.server ? Number(query.server) : undefined
  if (serverId !== undefined && (Number.isNaN(serverId) || serverId <= 0)) {
    throw createError({ statusCode: 400, statusMessage: "Parameter 'server' must be a positive integer." })
  }

  // Pagination
  const page = Math.max(1, Number(query.page) || 1)
  let pageSize = Number(query.pageSize) || 25
  if (Number.isNaN(pageSize) || pageSize <= 0) pageSize = 25
  pageSize = Math.min(Math.max(pageSize, 1), 200)
  const offset = (page - 1) * pageSize

  // Resolve season: if provided, validate existence; else active -> last
  const providedSeason = query.season ? Number(query.season) : undefined
  if (providedSeason !== undefined && (Number.isNaN(providedSeason) || providedSeason <= 0)) {
    throw createError({ statusCode: 400, statusMessage: "Parameter 'season' must be a positive integer." })
  }

  let seasonId: number | undefined

  if (providedSeason) {
    const seasonExists = await db
      .select({ id: tables.seasons.id })
      .from(tables.seasons)
      .where(eq(tables.seasons.id, providedSeason))
      .limit(1)

    seasonId = seasonExists[0]?.id
    if (!seasonId) {
      // If explicit season not found, return empty set with meta
      return { items: [], meta: { modId, seasonId: null, mmrType, sort: sortDir, page, pageSize, total: 0, totalPages: 0 } }
    }
  } else {
    // No explicit season provided — active first, else latest
    const activeSeason = await db
      .select({ id: tables.seasons.id })
      .from(tables.seasons)
      .where(eq(tables.seasons.isActive, 1))
      .orderBy(desc(tables.seasons.id))
      .limit(1)

    seasonId = activeSeason[0]?.id

    if (!seasonId) {
      const latestSeason = await db
        .select({ id: tables.seasons.id })
        .from(tables.seasons)
        .orderBy(desc(tables.seasons.id))
        .limit(1)
      seasonId = latestSeason[0]?.id
    }
  }

  if (!seasonId) {
    return { items: [], meta: { modId, seasonId: null, mmrType, sort: sortDir, page, pageSize, total: 0, totalPages: 0 } }
  }

  // Pick MMR column by type
  const mmrCol = mmrType === 'solo' ? tables.playersStats.mmr : tables.playersStats.overallMmr

  // Build conditions
  const conditions: WhereCondition[] = [
    eq(tables.playersStats.seasonId, seasonId),
    eq(tables.playersStats.modId, modId),
  ]

  if (serverId) {
    conditions.push(eq(tables.players.serverId, serverId) as unknown as WhereCondition)
  }

  if (search.length > 0) {
    // Case-insensitive search over name and lastNicknames
    const pattern = `%${search}%`
    conditions.push(
      sql`(LOWER(${tables.players.name}) LIKE ${pattern} OR LOWER(${tables.players.lastNicknames}) LIKE ${pattern})` as unknown as WhereCondition
    )
  }

  // Count total for pagination
  const totalRows = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tables.playersStats)
    .innerJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
    .where(and(...conditions))

  const total = Number(totalRows?.[0]?.count || 0)
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)

  // Query ladder page
  const rows = await db
    .select({
      playerId: tables.players.id,
      name: tables.players.name,
      avatarUrl: tables.players.avatarUrl,
      mmr: mmrCol,
    })
    .from(tables.playersStats)
    .innerJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
    .where(and(...conditions))
    .orderBy(sortDir === 'asc' ? asc(mmrCol) : desc(mmrCol))
    .limit(pageSize)
    .offset(offset)

  const items = rows.map((r, idx) => ({
    rank: offset + idx + 1,
    playerId: r.playerId,
    name: r.name,
    avatarUrl: r.avatarUrl,
    mmr: r.mmr,
  }))

  return {
    items,
    meta: { modId, seasonId, mmrType, sort: sortDir, page, pageSize, total, totalPages },
  }
})
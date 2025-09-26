import { and, or, eq, inArray, gte, lte, asc, desc, sql } from 'drizzle-orm'
import {
  buildLoserRaceCondition,
  buildWinnerRaceCondition,
} from '~~/server/utils/condition-builders'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import {
  parsePagination,
  parseProvidedSeason,
  resolveSeasonId,
  parseModId,
  parseServerId,
  parseSort,
} from '~~/server/utils/params-validators'

defineRouteMeta({
  openAPI: {
    description:
      'Paginated list of games (battles) with support for filtering by player Steam IDs, date range, mod, season, winner/loser races, server, duration, and map.',
    parameters: [
      {
        in: 'query',
        name: 'mod',
        required: false,
        description: 'Mod ID (mod_id) or technical name',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'season',
        required: false,
        description:
          'Explicit season ID. If not provided — the active season is used, otherwise — the latest available.',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'server',
        required: false,
        description: 'Server ID (maps to servers table)',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'sid',
        required: false,
        description: 'Single Steam ID to filter by',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'sids',
        required: false,
        description: 'Comma-separated Steam IDs list to filter by',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'dateFrom',
        required: false,
        description: 'Start datetime (ISO string)',
        schema: { type: 'string', format: 'date-time' },
      },
      {
        in: 'query',
        name: 'dateTo',
        required: false,
        description: 'End datetime (ISO string)',
        schema: { type: 'string', format: 'date-time' },
      },
      {
        in: 'query',
        name: 'winnerRaces',
        required: false,
        description: 'Comma-separated race IDs that won',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'loserRaces',
        required: false,
        description: 'Comma-separated race IDs that lost',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'map',
        required: false,
        description: 'Exact map name match',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'mapLike',
        required: false,
        description: 'Substring match for map name',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'minDuration',
        required: false,
        description: 'Minimum game duration (seconds)',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'maxDuration',
        required: false,
        description: 'Maximum game duration (seconds)',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'isAuto',
        required: false,
        description: 'Filter by automatch games (true/false or 1/0)',
        schema: { type: 'boolean' },
      },
      {
        in: 'query',
        name: 'sort',
        required: false,
        description: "Sort by date: 'asc' or 'desc' (default 'desc')",
        schema: { type: 'string', enum: ['asc', 'desc'] },
      },
      {
        in: 'query',
        name: 'page',
        required: false,
        description: 'Page number (1-based)',
        schema: { type: 'integer', default: 1 },
      },
      {
        in: 'query',
        name: 'pageSize',
        required: false,
        description: 'Items per page (max 200)',
        schema: { type: 'integer', default: 25 },
      },
    ],
    responses: { 200: { description: 'Successful response with items and meta' } },
  },
})

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const query = getQuery(event)

  const { page, pageSize, offset } = parsePagination(query)
  const sortDir = parseSort(query)

  // Season resolution
  const providedSeason = parseProvidedSeason(query)
  const seasonId = await resolveSeasonId(db, providedSeason)

  // Mod resolution -> map to technical name stored in games.game_mod
  const modId = await parseModId(query, db, false)
  let modTechName: string | undefined
  if (modId) {
    const m = await db
      .select({ tech: tables.mods.technicalName })
      .from(tables.mods)
      .where(eq(tables.mods.id, modId))
      .limit(1)
    modTechName = m[0]?.tech
  }

  // Server resolution -> filter games by base_server_name via servers.name
  const serverId = parseServerId(query)
  let serverName: string | undefined
  if (serverId) {
    const s = await db
      .select({ name: tables.servers.name })
      .from(tables.servers)
      .where(eq(tables.servers.id, serverId))
      .limit(1)
    serverName = s[0]?.name
    if (!serverName) {
      throw createError({ statusCode: 400, statusMessage: 'Server not found' })
    }
  }

  // Base conditions
  const conditions = []
  // Confirmed games only
  conditions.push(eq(tables.games.confirmed, 1))
  if (seasonId) {
    conditions.push(eq(tables.games.seasonId, seasonId))
  }
  if (modTechName) {
    conditions.push(eq(tables.games.gameMod, modTechName))
  }
  if (serverName) {
    conditions.push(eq(tables.games.baseServerName, serverName))
  }

  // Date range on cTime
  if (query.dateFrom) {
    conditions.push(gte(tables.games.cTime, String(query.dateFrom)))
  }
  if (query.dateTo) {
    conditions.push(lte(tables.games.cTime, String(query.dateTo)))
  }

  // Duration
  const minDuration = query.minDuration ? Number(query.minDuration) : undefined
  const maxDuration = query.maxDuration ? Number(query.maxDuration) : undefined
  if (minDuration !== undefined && !Number.isNaN(minDuration)) {
    conditions.push(gte(tables.games.gTime, minDuration))
  }
  if (maxDuration !== undefined && !Number.isNaN(maxDuration)) {
    conditions.push(lte(tables.games.gTime, maxDuration))
  }

  // Map filters
  if (query.map) {
    conditions.push(eq(tables.games.map, String(query.map)))
  }
  if (query.mapLike) {
    const pattern = `%${String(query.mapLike).toLowerCase()}%`
    // games.map is case-sensitive in SQL; normalize using LOWER for matching
    conditions.push(sql`LOWER(${tables.games.map}) LIKE ${pattern}`)
  }

  // Automatch filter
  if (query.isAuto !== undefined) {
    const val = String(query.isAuto).toLowerCase()
    const truthy = val === '1' || val === 'true' || val === 'yes' || val === 'on'
    const falsy = val === '0' || val === 'false' || val === 'no' || val === 'off'
    if (truthy || falsy) {
      conditions.push(eq(tables.games.isAuto, truthy ? 1 : 0))
    }
  }

  // Steam IDs filters
  const sidsRaw: string[] = []
  if (query.sid) sidsRaw.push(String(query.sid))
  if (query.sids) {
    const parts = String(query.sids)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    sidsRaw.push(...parts)
  }
  const sids = Array.from(new Set(sidsRaw))
  if (sids.length > 0) {
    conditions.push(
      or(
        inArray(tables.games.sid1, sids),
        inArray(tables.games.sid2, sids),
        inArray(tables.games.sid3, sids),
        inArray(tables.games.sid4, sids),
        inArray(tables.games.sid5, sids),
        inArray(tables.games.sid6, sids),
        inArray(tables.games.sid7, sids),
        inArray(tables.games.sid8, sids)
      )
    )
  }

  // Winner/Loser race filters
  const winnerRaceIds: number[] = String(query.winnerRaces || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0)
  const loserRaceIds: number[] = String(query.loserRaces || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0)

  if (winnerRaceIds.length > 0) {
    const winnerConds = winnerRaceIds.map((rid) => buildWinnerRaceCondition(rid))
    conditions.push(or(...winnerConds))
  }
  if (loserRaceIds.length > 0) {
    const loserConds = loserRaceIds.map((rid) => buildLoserRaceCondition(rid))
    conditions.push(or(...loserConds))
  }

  // Count total
  const totalRows = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(tables.games)
    .where(and(...conditions))
  const total = totalRows[0]?.total ?? 0
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0

  // Fetch page
  const rows = await db
    .select({
      id: tables.games.id,
      type: tables.games.type,
      map: tables.games.map,
      cTime: tables.games.cTime,
      gTime: tables.games.gTime,
      gameMod: tables.games.gameMod,
      modVersion: tables.games.modVersion,
      serverName: tables.games.baseServerName,
      seasonId: tables.games.seasonId,
      replayLink: tables.games.replayLink,
      rankColumn: tables.games.rankColumn,
      sid1: tables.games.sid1,
      sid2: tables.games.sid2,
      sid3: tables.games.sid3,
      sid4: tables.games.sid4,
      sid5: tables.games.sid5,
      sid6: tables.games.sid6,
      sid7: tables.games.sid7,
      sid8: tables.games.sid8,
      p1: tables.games.p1,
      p2: tables.games.p2,
      p3: tables.games.p3,
      p4: tables.games.p4,
      p5: tables.games.p5,
      p6: tables.games.p6,
      p7: tables.games.p7,
      p8: tables.games.p8,
      r1: tables.games.r1,
      r2: tables.games.r2,
      r3: tables.games.r3,
      r4: tables.games.r4,
      r5: tables.games.r5,
      r6: tables.games.r6,
      r7: tables.games.r7,
      r8: tables.games.r8,
      w1: tables.games.w1,
      w2: tables.games.w2,
      w3: tables.games.w3,
      w4: tables.games.w4,
      isAuto: tables.games.isAuto,
      relicGameId: tables.games.relic_game_id,
    })
    .from(tables.games)
    .where(and(...conditions))
    .orderBy(sortDir === 'asc' ? asc(tables.games.cTime) : desc(tables.games.cTime))
    .limit(pageSize)
    .offset(offset)

  return {
    items: rows,
    meta: {
      modId,
      modTechnicalName: modTechName ?? null,
      seasonId,
      serverId: serverId ?? null,
      sort: sortDir,
      page,
      pageSize,
      total,
      totalPages,
    },
  }
})

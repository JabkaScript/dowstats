import { and, eq, asc } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import {
  parseModId,
  parseProvidedSeason,
  resolveSeasonId,
  getTotalGamesExpr,
  getTotalWinsExpr,
} from '~~/server/utils/ladderParams'

defineRouteMeta({
  openAPI: {
    description:
      'Player statistics for a given mod and optional season. If season is not provided, the active season is used, otherwise the latest available. Returns basic profile, MMR metrics, and total games/wins for solo and team.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Player ID',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'mod',
        required: true,
        description: 'Mod ID (mod_id) to fetch stats for',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'season',
        required: false,
        description:
          'Explicit season ID. If not provided — the active season is used, otherwise — the latest available.',
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: {
        description: 'Successful response. `item` can be null if no stats found for filters.',
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const db = useDrizzle()

  const idParam = getRouterParam(event, 'id')
  const playerId = Number(idParam)

  if (!playerId || Number.isNaN(playerId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Path parameter 'id' must be a positive integer.",
    })
  }

  const query = getQuery(event)
  const modId = parseModId(query)
  const providedSeason = parseProvidedSeason(query)

  const seasonId = await resolveSeasonId(db, providedSeason)

  if (!seasonId) {
    return { item: null, meta: { playerId, modId, seasonId: null } }
  }

  const soloGamesExpr = getTotalGamesExpr('solo')
  const soloWinsExpr = getTotalWinsExpr('solo')
  const teamGamesExpr = getTotalGamesExpr('team')
  const teamWinsExpr = getTotalWinsExpr('team')

  const rows = await db
    .select({
      playerId: tables.players.id,
      name: tables.players.name,
      avatarUrl: tables.players.avatarUrl,
      serverId: tables.players.serverId,
      mmr: tables.playersStats.mmr,
      overallMmr: tables.playersStats.overallMmr,
      maxMmr: tables.playersStats.maxMmr,
      maxOverallMmr: tables.playersStats.maxOverallMmr,
      totalGamesSolo: soloGamesExpr,
      totalWinsSolo: soloWinsExpr,
      totalGamesTeam: teamGamesExpr,
      totalWinsTeam: teamWinsExpr,
    })
    .from(tables.playersStats)
    .innerJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
    .where(
      and(
        eq(tables.playersStats.playerId, playerId),
        eq(tables.playersStats.modId, modId),
        eq(tables.playersStats.seasonId, seasonId)
      )
    )
    .limit(1)

  const row = rows[0]
  if (!row) {
    return { item: null, meta: { playerId, modId, seasonId } }
  }

  // Fetch detailed per-race stats for all formats
  const detailsRows = await db
    .select({
      // 1v1
      g1_1v1: tables.playersStats['1X11'],
      w1_1v1: tables.playersStats['1X11W'],
      g2_1v1: tables.playersStats['1X12'],
      w2_1v1: tables.playersStats['1X12W'],
      g3_1v1: tables.playersStats['1X13'],
      w3_1v1: tables.playersStats['1X13W'],
      g4_1v1: tables.playersStats['1X14'],
      w4_1v1: tables.playersStats['1X14W'],
      g5_1v1: tables.playersStats['1X15'],
      w5_1v1: tables.playersStats['1X15W'],
      g6_1v1: tables.playersStats['1X16'],
      w6_1v1: tables.playersStats['1X16W'],
      g7_1v1: tables.playersStats['1X17'],
      w7_1v1: tables.playersStats['1X17W'],
      g8_1v1: tables.playersStats['1X18'],
      w8_1v1: tables.playersStats['1X18W'],
      g9_1v1: tables.playersStats['1X19'],
      w9_1v1: tables.playersStats['1X19W'],
      // 2v2
      g1_2v2: tables.playersStats['2X21'],
      w1_2v2: tables.playersStats['2X21W'],
      g2_2v2: tables.playersStats['2X22'],
      w2_2v2: tables.playersStats['2X22W'],
      g3_2v2: tables.playersStats['2X23'],
      w3_2v2: tables.playersStats['2X23W'],
      g4_2v2: tables.playersStats['2X24'],
      w4_2v2: tables.playersStats['2X24W'],
      g5_2v2: tables.playersStats['2X25'],
      w5_2v2: tables.playersStats['2X25W'],
      g6_2v2: tables.playersStats['2X26'],
      w6_2v2: tables.playersStats['2X26W'],
      g7_2v2: tables.playersStats['2X27'],
      w7_2v2: tables.playersStats['2X27W'],
      g8_2v2: tables.playersStats['2X28'],
      w8_2v2: tables.playersStats['2X28W'],
      g9_2v2: tables.playersStats['2X29'],
      w9_2v2: tables.playersStats['2X29W'],
      // 3v3
      g1_3v3: tables.playersStats['3X31'],
      w1_3v3: tables.playersStats['3X31W'],
      g2_3v3: tables.playersStats['3X32'],
      w2_3v3: tables.playersStats['3X32W'],
      g3_3v3: tables.playersStats['3X33'],
      w3_3v3: tables.playersStats['3X33W'],
      g4_3v3: tables.playersStats['3X34'],
      w4_3v3: tables.playersStats['3X34W'],
      g5_3v3: tables.playersStats['3X35'],
      w5_3v3: tables.playersStats['3X35W'],
      g6_3v3: tables.playersStats['3X36'],
      w6_3v3: tables.playersStats['3X36W'],
      g7_3v3: tables.playersStats['3X37'],
      w7_3v3: tables.playersStats['3X37W'],
      g8_3v3: tables.playersStats['3X38'],
      w8_3v3: tables.playersStats['3X38W'],
      g9_3v3: tables.playersStats['3X39'],
      w9_3v3: tables.playersStats['3X39W'],
      // 4v4
      g1_4v4: tables.playersStats['4X41'],
      w1_4v4: tables.playersStats['4X41W'],
      g2_4v4: tables.playersStats['4X42'],
      w2_4v4: tables.playersStats['4X42W'],
      g3_4v4: tables.playersStats['4X43'],
      w3_4v4: tables.playersStats['4X43W'],
      g4_4v4: tables.playersStats['4X44'],
      w4_4v4: tables.playersStats['4X44W'],
      g5_4v4: tables.playersStats['4X45'],
      w5_4v4: tables.playersStats['4X45W'],
      g6_4v4: tables.playersStats['4X46'],
      w6_4v4: tables.playersStats['4X46W'],
      g7_4v4: tables.playersStats['4X47'],
      w7_4v4: tables.playersStats['4X47W'],
      g8_4v4: tables.playersStats['4X48'],
      w8_4v4: tables.playersStats['4X48W'],
      g9_4v4: tables.playersStats['4X49'],
      w9_4v4: tables.playersStats['4X49W'],
    })
    .from(tables.playersStats)
    .where(
      and(
        eq(tables.playersStats.playerId, playerId),
        eq(tables.playersStats.modId, modId),
        eq(tables.playersStats.seasonId, seasonId)
      )
    )
    .limit(1)

  const d = detailsRows[0] as Record<string, number | null> | undefined

  const races = await db
    .select({ id: tables.races.id, name: tables.races.name, shortName: tables.races.shortName })
    .from(tables.races)
    .orderBy(asc(tables.races.id))

  const raceById = new Map<number, { name: string | null; shortName: string | null }>(
    races.map((r) => [Number(r.id), { name: r.name, shortName: r.shortName }])
  )

  function statFor(key: string) {
    return Number((d?.[key] ?? 0) as number)
  }

  const fmt1v1 = Array.from({ length: 9 }, (_, i) => {
    const idx = i + 1
    const games = statFor(`g${idx}_1v1`)
    const wins = statFor(`w${idx}_1v1`)
    const losses = Math.max(0, games - wins)
    const info = raceById.get(idx)
    return {
      raceId: idx,
      raceName: info?.name ?? null,
      raceShortName: info?.shortName ?? null,
      games,
      wins,
      losses,
    }
  })

  const fmt2v2 = Array.from({ length: 9 }, (_, i) => {
    const idx = i + 1
    const games = statFor(`g${idx}_2v2`)
    const wins = statFor(`w${idx}_2v2`)
    const losses = Math.max(0, games - wins)
    const info = raceById.get(idx)
    return {
      raceId: idx,
      raceName: info?.name ?? null,
      raceShortName: info?.shortName ?? null,
      games,
      wins,
      losses,
    }
  })

  const fmt3v3 = Array.from({ length: 9 }, (_, i) => {
    const idx = i + 1
    const games = statFor(`g${idx}_3v3`)
    const wins = statFor(`w${idx}_3v3`)
    const losses = Math.max(0, games - wins)
    const info = raceById.get(idx)
    return {
      raceId: idx,
      raceName: info?.name ?? null,
      raceShortName: info?.shortName ?? null,
      games,
      wins,
      losses,
    }
  })

  const fmt4v4 = Array.from({ length: 9 }, (_, i) => {
    const idx = i + 1
    const games = statFor(`g${idx}_4v4`)
    const wins = statFor(`w${idx}_4v4`)
    const losses = Math.max(0, games - wins)
    const info = raceById.get(idx)
    return {
      raceId: idx,
      raceName: info?.name ?? null,
      raceShortName: info?.shortName ?? null,
      games,
      wins,
      losses,
    }
  })

  const winrate = (wins: number | null, games: number | null) =>
    games && games > 0 && wins != null ? Math.round((wins / games) * 1000) / 10 : null

  const item = {
    playerId: row.playerId,
    name: row.name,
    avatarUrl: row.avatarUrl,
    serverId: row.serverId,
    modId,
    seasonId,
    mmr: row.mmr,
    overallMmr: row.overallMmr,
    maxMmr: row.maxMmr,
    maxOverallMmr: row.maxOverallMmr,
    solo: {
      totalGames: row.totalGamesSolo,
      totalWins: row.totalWinsSolo,
      winrate: winrate(row.totalWinsSolo, row.totalGamesSolo),
    },
    team: {
      totalGames: row.totalGamesTeam,
      totalWins: row.totalWinsTeam,
      winrate: winrate(row.totalWinsTeam, row.totalGamesTeam),
    },
    formats: {
      '1v1': fmt1v1,
      '2v2': fmt2v2,
      '3v3': fmt3v3,
      '4v4': fmt4v4,
    },
  }

  return { item, meta: { playerId, modId, seasonId } }
})

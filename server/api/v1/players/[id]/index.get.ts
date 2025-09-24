import { and, eq } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import {
  parseModId,
  parseProvidedSeason,
  resolveSeasonId,
  getTotalGamesExpr,
  getTotalWinsExpr,
  getPlayerId,
} from '~~/server/utils/params-validators'

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
        description: 'Mod ID or Mod tech_name to fetch stats for. If not provided — dxp2 is used.',
        schema: { type: 'integer', default: 'dxp2' },
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

  const query = getQuery(event)
  const playerId = await getPlayerId(idParam)
  const modId = await parseModId(query, db)
  const providedSeason = parseProvidedSeason(query)
  const seasonId = await resolveSeasonId(db, providedSeason)

  const soloGamesExpr = getTotalGamesExpr('solo')
  const soloWinsExpr = getTotalWinsExpr('solo')
  const teamGamesExpr = getTotalGamesExpr('team')
  const teamWinsExpr = getTotalWinsExpr('team')

  const rows = await db
    .select({
      playerId: tables.players.id,
      sid: tables.players.sid,
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
    .leftJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
    .where(
      and(
        eq(tables.players.id, playerId),
        eq(tables.playersStats.modId, modId),
        eq(tables.playersStats.seasonId, seasonId)
      )
    )
    .limit(1)

  const row = rows[0]
  if (!row) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Player not found',
    })
  }

  return { item: row, meta: { playerId, modId, seasonId } }
})

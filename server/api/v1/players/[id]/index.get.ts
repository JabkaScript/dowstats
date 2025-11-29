import { and, eq } from 'drizzle-orm'
import { getQuery, getRouterParam, createError } from 'h3'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import {
  parseModId,
  parseProvidedSeason,
  resolveSeasonId,
  getPlayerId,
} from '~~/server/utils/params-validators'

defineRouteMeta({
  openAPI: {
    description:
      'Player statistics for a given mod and optional season. Returns full playersStats row including race breakdown (e.g. 1x11W) alongside basic profile info. If season is not provided, the active season is used, otherwise the latest available.',
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
        schema: { type: 'string', default: 'dxp2' },
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

  const rows = await db
    .select({
      playerId: tables.players.id,
      sid: tables.players.sid,
      name: tables.players.name,
      avatarUrl: tables.players.avatarUrlBig,
      serverId: tables.players.serverId,
      stats: tables.playersStats,
    })
    .from(tables.players)
    .leftJoin(
      tables.playersStats,
      and(
        eq(tables.playersStats.playerId, tables.players.id),
        eq(tables.playersStats.modId, modId),
        eq(tables.playersStats.seasonId, seasonId)
      )
    )
    .where(eq(tables.players.id, playerId))
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

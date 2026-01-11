import { defineEventHandler, getQuery, getHeader, createError } from 'h3'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import { eq, inArray, and, sql, desc } from 'drizzle-orm'
import fs from 'node:fs'
import path from 'node:path'
import { StatsItem } from '~~/server/interfaces/client'
import { fetchSteamProfiles, pickAvatars } from '~~/server/utils/steam'

defineRouteMeta({
  openAPI: {
    description:
      'Legacy stats5 API endpoint for client integration. Returns detailed player statistics including race winrates, MMR, and rank. Handles player creation if missing.',
    parameters: [
      {
        in: 'query',
        name: 'sids',
        required: true,
        description: 'Comma-separated list of Steam IDs (bigint)',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'nicks',
        required: false,
        description: 'Comma-separated list of base64 encoded nicknames corresponding to sids',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'mod_tech_name',
        required: false,
        description: 'Technical name of the mod (e.g. "dxp2", "dowde")',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'modId',
        required: false,
        description: 'Mod ID (alternative to mod_tech_name)',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'seasonId',
        required: false,
        description: 'Season ID. If not provided, active season is used.',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'api_secret',
        required: false,
        description: 'API secret for authentication (alternative to Authorization header)',
        schema: { type: 'string' },
      },
    ],
    security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                modName: { type: 'string' },
                seasonName: { type: 'string' },
                stats: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sid: { type: 'string' },
                      name: { type: 'string', nullable: true },
                      avatarUrl: { type: 'string', nullable: true },
                      gamesCount: { type: 'integer' },
                      winsCount: { type: 'integer' },
                      winRate: { type: 'integer' },
                      mmr: { type: 'integer' },
                      mmr1v1: { type: 'integer' },
                      rank: { type: 'integer' },
                      race: { type: 'integer' },
                      apm: { type: 'number' },
                      isBanned: { type: 'boolean' },
                      banType: { type: 'string', nullable: true },
                      banReason: { type: 'string', nullable: true },
                      custom_games_mmr: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
    },
  },
})

// Helper to decode base64 nickname
function decodeNickRaw(raw: string): string | null {
  raw = (raw || '').trim()
  if (!raw || !/^[A-Za-z0-9+/=%]+$/.test(raw) || raw.length % 4 !== 0) {
    return null
  }
  try {
    const buffer = Buffer.from(raw, 'base64')
    const decoded = buffer.toString('utf8').trim()
    // Remove control characters (approximate PHP's preg_replace('/[\x00-\x1F\x7F]/', '', $decoded))
    // eslint-disable-next-line no-control-regex
    const sanitized = decoded.replace(/[\x00-\x1F\x7F]/g, '')
    if (!sanitized || sanitized.length > 64) {
      return null
    }
    return sanitized
  } catch {
    return null
  }
}

// Helper to get rank by MMR
async function getRankByMmr(
  db: ReturnType<typeof useDrizzle>,
  mmr: number,
  modId: number,
  seasonId: number
): Promise<number> {
  const res = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tables.playersStats)
    .where(
      and(
        eq(tables.playersStats.modId, modId),
        eq(tables.playersStats.seasonId, seasonId),
        sql`${tables.playersStats.mmr} > ${mmr}`
      )
    )
  return (Number(res[0]?.count) || 0) + 1
}

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const query = getQuery(event)

  // 1. Authentication
  let authOk = false
  const configSecret = process.env.NUXT_API_SECRET
  let fileSecret = ''

  // Try to read dowstats.ini if env var is missing
  if (!configSecret) {
    try {
      // Assuming workspace root is current dir, check parent dir for dowstats.ini
      const iniPath = path.resolve(process.cwd(), '../dowstats.ini')
      if (fs.existsSync(iniPath)) {
        const content = fs.readFileSync(iniPath, 'utf-8')
        const match = content.match(/api_secret\s*=\s*["']?([^"'\n]+)["']?/)
        if (match) {
          fileSecret = match[1]
        }
      }
    } catch {
      // Ignore error
    }
  }

  const secret = configSecret || fileSecret
  if (!secret) {
    // If no secret configured, allow access (PHP logic fallback)
    authOk = true
  } else {
    const authHeader = getHeader(event, 'Authorization') || ''
    const match = authHeader.match(/^\s*bearer\s+(.+)$/i)
    if (match && match[1] === secret) {
      authOk = true
    }
    if (!authOk && getHeader(event, 'Key') === secret) {
      authOk = true
    }
    if (!authOk && query.api_secret === secret) {
      authOk = true
    }
  }

  if (!authOk) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: 'Unauthorized' },
    })
  }

  // 2. Process Params
  const sidsParam = (query.sids || '').toString()
  const sids = sidsParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s)

  const nicksParam = (query.nicks || '').toString()
  const nicksRaw = nicksParam.split(',').map((s) => s.trim())

  const modTechName = (query.mod_tech_name || '').toString().trim()
  let modId = parseInt((query.modId || '0').toString()) || 0
  let seasonId = parseInt((query.seasonId || '').toString()) || 0

  // Resolve Mod
  let modName = ''
  let isDowde = false

  if (modTechName) {
    const mod = await db.query.mods.findFirst({
      where: eq(tables.mods.technicalName, modTechName),
      columns: { id: true, name: true, technicalName: true },
    })
    if (mod) {
      modId = mod.id
      modName = mod.name
      isDowde = mod.technicalName.toLowerCase() === 'dowde'
    }
  }

  if (!modId) modId = 1

  if (!modName) {
    const mod = await db.query.mods.findFirst({
      where: eq(tables.mods.id, modId),
      columns: { name: true, technicalName: true },
    })
    if (mod) {
      modName = mod.name
      if (!isDowde) isDowde = mod.technicalName.toLowerCase() === 'dowde'
    }
  }

  // Resolve Season
  let seasonName = ''
  if (seasonId && !isNaN(seasonId)) {
    const season = await db.query.seasons.findFirst({
      where: eq(tables.seasons.id, seasonId),
      columns: { seasonName: true },
    })
    if (season) seasonName = season.seasonName
  }

  // Fallback for season if not found or not provided
  if (!seasonName) {
    // Need to find active season or latest
    const activeSeason = await db.query.seasons.findFirst({
      where: eq(tables.seasons.isActive, 1),
      orderBy: [desc(tables.seasons.id)],
      columns: { id: true, seasonName: true },
    })

    if (activeSeason) {
      seasonId = activeSeason.id
      seasonName = activeSeason.seasonName
    } else {
      seasonId = 1
      seasonName = 'Off-season'
    }
  }

  // 3. Prepare Player Data (Create missing)
  if (sids.length === 0) {
    return { modName, seasonName, stats: [] }
  }

  // Fetch existing players
  const playersInDb = await db.query.players.findMany({
    where: inArray(
      tables.players.sid,
      sids.map((s) => BigInt(s))
    ), // SID is bigint
    columns: { id: true, sid: true, name: true, avatarUrl: true },
  })

  const existingSids = new Set(playersInDb.map((p) => String(p.sid)))
  const missingSids = sids.filter((sid) => !existingSids.has(sid))

  // Create missing players
  if (missingSids.length > 0) {
    // Try to fetch Steam profiles for missing SIDs (if API key configured)
    const steamProfiles = await fetchSteamProfiles(missingSids)
    for (const sid of missingSids) {
      const idx = sids.indexOf(sid)
      let name = ''
      if (idx !== -1 && nicksRaw[idx]) {
        name = decodeNickRaw(nicksRaw[idx]) || sid
      } else {
        name = sid
      }
      // Prefer Steam persona name if present
      const sp = steamProfiles[sid]
      if (sp?.personaname) name = sp.personaname

      // Pick avatars from Steam or fallback
      const picked = sp ? pickAvatars(sp) : undefined
      const avatarSmall = picked?.medium || picked?.small || '/images/default_avatar.jpg'
      const avatarBig = picked?.full || avatarSmall

      // Insert ignore
      await db
        .insert(tables.players)
        .ignore()
        .values({
          sid: BigInt(sid),
          name: name,
          avatarUrl: avatarSmall,
          avatarUrlBig: avatarBig, // Schema requires this
          apm: 0,
          lastUpdateTime: new Date().toISOString(),
        })
    }
  }

  // Refresh name/avatar for all provided SIDs from Steam (best-effort)
  try {
    const steamProfilesAll = await fetchSteamProfiles(sids)
    for (const sid of sids) {
      const sp = steamProfilesAll[sid]
      if (!sp) continue
      const picked = pickAvatars(sp)
      const set: Record<string, any> = { lastUpdateTime: new Date().toISOString() }
      if (sp.personaname) set.name = sp.personaname
      if (picked.medium || picked.small) set.avatarUrl = picked.medium || picked.small
      if (picked.full || picked.medium || picked.small)
        set.avatarUrlBig = picked.full || picked.medium || picked.small
      await db
        .update(tables.players)
        .set(set)
        .where(eq(tables.players.sid, BigInt(sid)))
    }
  } catch {
    // ignore refresh errors to keep endpoint resilient
  }

  // Refetch players including new ones
  const allPlayers = await db.query.players.findMany({
    where: inArray(
      tables.players.sid,
      sids.map((s) => BigInt(s))
    ),
    columns: { id: true, sid: true, name: true, avatarUrl: true },
  })

  // Ensure stats exist
  const playerIds = allPlayers.map((p) => p.id)
  if (playerIds.length > 0) {
    const finalStatsValues = playerIds.map((pid) => ({
      playerId: pid,
      seasonId: seasonId,
      modId: modId,
      mmr: 1500,
      overallMmr: 1500,
      maxMmr: 1500,
      maxOverallMmr: 1500,
    }))

    if (finalStatsValues.length > 0) {
      await db.insert(tables.playersStats).ignore().values(finalStatsValues)
    }
  }

  // 4. Fetch Stats
  const statsRows = await db
    .select({
      sid: tables.players.sid,
      name: tables.players.name,
      avatarUrl: tables.players.avatarUrl,
      apm: tables.players.apm,
      mmr: tables.playersStats.mmr,
      overallMmr: tables.playersStats.overallMmr,
      // Race stats
      '1x1_1w': tables.playersStats['1X11W'],
      '1x1_1': tables.playersStats['1X11'],
      '1x1_2w': tables.playersStats['1X12W'],
      '1x1_2': tables.playersStats['1X12'],
      '1x1_3w': tables.playersStats['1X13W'],
      '1x1_3': tables.playersStats['1X13'],
      '1x1_4w': tables.playersStats['1X14W'],
      '1x1_4': tables.playersStats['1X14'],
      '1x1_5w': tables.playersStats['1X15W'],
      '1x1_5': tables.playersStats['1X15'],
      '1x1_6w': tables.playersStats['1X16W'],
      '1x1_6': tables.playersStats['1X16'],
      '1x1_7w': tables.playersStats['1X17W'],
      '1x1_7': tables.playersStats['1X17'],
      '1x1_8w': tables.playersStats['1X18W'],
      '1x1_8': tables.playersStats['1X18'],
      '1x1_9w': tables.playersStats['1X19W'],
      '1x1_9': tables.playersStats['1X19'],
      // 2v2
      '2x2_1w': tables.playersStats['2X21W'],
      '2x2_1': tables.playersStats['2X21'],
      '2x2_2w': tables.playersStats['2X22W'],
      '2x2_2': tables.playersStats['2X22'],
      '2x2_3w': tables.playersStats['2X23W'],
      '2x2_3': tables.playersStats['2X23'],
      '2x2_4w': tables.playersStats['2X24W'],
      '2x2_4': tables.playersStats['2X24'],
      '2x2_5w': tables.playersStats['2X25W'],
      '2x2_5': tables.playersStats['2X25'],
      '2x2_6w': tables.playersStats['2X26W'],
      '2x2_6': tables.playersStats['2X26'],
      '2x2_7w': tables.playersStats['2X27W'],
      '2x2_7': tables.playersStats['2X27'],
      '2x2_8w': tables.playersStats['2X28W'],
      '2x2_8': tables.playersStats['2X28'],
      '2x2_9w': tables.playersStats['2X29W'],
      '2x2_9': tables.playersStats['2X29'],
      // 3v3
      '3x3_1w': tables.playersStats['3X31W'],
      '3x3_1': tables.playersStats['3X31'],
      '3x3_2w': tables.playersStats['3X32W'],
      '3x3_2': tables.playersStats['3X32'],
      '3x3_3w': tables.playersStats['3X33W'],
      '3x3_3': tables.playersStats['3X33'],
      '3x3_4w': tables.playersStats['3X34W'],
      '3x3_4': tables.playersStats['3X34'],
      '3x3_5w': tables.playersStats['3X35W'],
      '3x3_5': tables.playersStats['3X35'],
      '3x3_6w': tables.playersStats['3X36W'],
      '3x3_6': tables.playersStats['3X36'],
      '3x3_7w': tables.playersStats['3X37W'],
      '3x3_7': tables.playersStats['3X37'],
      '3x3_8w': tables.playersStats['3X38W'],
      '3x3_8': tables.playersStats['3X38'],
      '3x3_9w': tables.playersStats['3X39W'],
      '3x3_9': tables.playersStats['3X39'],
      // 4v4
      '4x4_1w': tables.playersStats['4X41W'],
      '4x4_1': tables.playersStats['4X41'],
      '4x4_2w': tables.playersStats['4X42W'],
      '4x4_2': tables.playersStats['4X42'],
      '4x4_3w': tables.playersStats['4X43W'],
      '4x4_3': tables.playersStats['4X43'],
      '4x4_4w': tables.playersStats['4X44W'],
      '4x4_4': tables.playersStats['4X44'],
      '4x4_5w': tables.playersStats['4X45W'],
      '4x4_5': tables.playersStats['4X45'],
      '4x4_6w': tables.playersStats['4X46W'],
      '4x4_6': tables.playersStats['4X46'],
      '4x4_7w': tables.playersStats['4X47W'],
      '4x4_7': tables.playersStats['4X47'],
      '4x4_8w': tables.playersStats['4X48W'],
      '4x4_8': tables.playersStats['4X48'],
      '4x4_9w': tables.playersStats['4X49W'],
      '4x4_9': tables.playersStats['4X49'],

      customGamesMmr: tables.playersStats.customGamesMmr,
      // Bans
      isBanned: tables.playersBanned.id,
      banReason: tables.playersBanned.reason,
      banType: tables.playersBanned.banType,
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
    .leftJoin(tables.playersBanned, eq(tables.playersBanned.playerId, tables.players.id))
    .where(
      inArray(
        tables.players.sid,
        sids.map((s) => BigInt(s))
      )
    )

  const stats: StatsItem[] = []
  for (const row of statsRows) {
    let all = 0
    let win = 0
    let favRace = 0
    let countGamesForRace = 0

    // Process races
    for (let j = 1; j <= 9; j++) {
      let sum = 0
      for (let i = 1; i <= 4; i++) {
        const wKey = `${i}x${i}_${j}w` as keyof typeof row
        const cKey = `${i}x${i}_${j}` as keyof typeof row
        win += Number(row[wKey] || 0)
        sum += Number(row[cKey] || 0)
      }
      all += sum
      if (countGamesForRace < sum) {
        favRace = j
        countGamesForRace = sum
      }
    }

    const mmr = Number(row.mmr || 0)
    const rank = await getRankByMmr(db, mmr, modId, seasonId)

    const item: StatsItem = {
      sid: String(row.sid),
      name: row.name,
      avatarUrl: row.avatarUrl,
      gamesCount: all,
      winsCount: win,
      winRate: all !== 0 ? Math.round((100 * win) / all) : 0,
      mmr: Number(row.overallMmr || 0),
      mmr1v1: mmr,
      rank: rank,
      race: favRace,
      apm: Number(row.apm || 0),
      isBanned: !!row.isBanned,
    }

    if (row.isBanned) {
      if (row.banType) {
        item.banType = row.banType
        if (row.banType === 'software_use') {
          item.banReason = row.banReason
        }
      }
    }

    if (isDowde) {
      item.custom_games_mmr = Number(row.customGamesMmr || 0)
    }

    stats.push(item)
  }

  // Sort stats by input SID order
  const orderedStats = []
  const statsMap = new Map(stats.map((s) => [s.sid, s]))
  for (const sid of sids) {
    if (statsMap.has(sid)) {
      orderedStats.push(statsMap.get(sid))
    }
  }

  return {
    modName,
    seasonName,
    stats: orderedStats,
  }
})

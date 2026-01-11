import { defineEventHandler, getQuery, getHeader, createError } from 'h3'
import { and, eq, inArray, sql, desc } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import { updateRanksMinAndMax, getRankByMmr } from '~~/server/utils/ranks'
import { fetchSteamProfiles, pickAvatars } from '~~/server/utils/steam'
import { makeReplayKey, uploadReplay } from '~~/server/utils/s3'
import { applyEloAndCounters } from '~~/server/utils/game-updates'

defineRouteMeta({
  openAPI: {
    description:
      'Миграция send_replay5.php (GET). Принимает параметры игры, создает/обновляет запись в таблице games, обновляет MMR/статистику игроков, сохраняет реплей (если есть) в S3, пересчитывает диапазоны рангов.',
    parameters: [
      { in: 'query', name: 'version', schema: { type: 'integer' } },
      { in: 'query', name: 'type', schema: { type: 'integer', minimum: 1, maximum: 4 } },
      { in: 'query', name: 'sid', schema: { type: 'string' } },
      { in: 'query', name: 'map', schema: { type: 'string' } },
      { in: 'query', name: 'winby', schema: { type: 'string' } },
      { in: 'query', name: 'gtime', schema: { type: 'integer' } },
      { in: 'query', name: 'apm', schema: { type: 'integer' } },
      { in: 'query', name: 'mod', schema: { type: 'string' } },
      { in: 'query', name: 'mod_version', schema: { type: 'string' } },
      { in: 'query', name: 'isRanked', schema: { type: 'integer' } },
      { in: 'query', name: 'isFullStdGame', schema: { type: 'integer' } },
      { in: 'query', name: 'isAuto', schema: { type: 'integer' } },
      { in: 'query', name: 'relicGameId', schema: { type: 'integer' } },
      // Repeated arrays p1..p8 (base64), r1..r8 (race), w1..w4 (winners), sid1..sid8
    ],
    security: [{ ApiKeyAuth: [] }],
    responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
  },
})

function b64DecodeSafe(v: string | undefined): string {
  if (!v) return ''
  try {
    const raw = (v || '').replace(/\s+/g, '+')
    const buf = Buffer.from(raw, 'base64')
    const txt = buf.toString('utf-8').trim()
    return txt.replace(/[\x00-\x1F\x7F]/g, '')
  } catch {
    return ''
  }
}

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const q = getQuery(event)

  // Auth: header Key must match api_secret (as in PHP)
  const iniSecret = process.env.NUXT_API_SECRET || ''
  const headerKey = getHeader(event, 'key') || getHeader(event, 'Key') || ''
  if (iniSecret && headerKey !== iniSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const version = Number(q.version || 0)
  const type = Math.max(0, Math.min(4, Number(q.type || 0)))
  if (version < 21400) {
    throw createError({ statusCode: 400, statusMessage: 'collector version is too old' })
  }
  if (type < 1) {
    throw createError({ statusCode: 400, statusMessage: 'type is required (1..4)' })
  }

  const sidSender = (q.sid || '').toString()
  const map = (q.map || '').toString()
  const winby = (q.winby || '').toString().toLowerCase()
  const gTime = Number(q.gtime || 0)
  let apm = Number(q.apm || 0)
  if (apm > 1000) apm = 0
  if (gTime <= 30) return { ok: true, gameId: null, skipped: 'short_game' }

  const modTech = ((q.mod || '') as string).toLowerCase()
  const isDowde = modTech === 'dowde'
  const modVersionRaw = (q.mod_version || '').toString()
  const modVersion = b64DecodeSafe(modVersionRaw) || modVersionRaw
  const isRanked = Number(q.isRanked ?? 1) ? 1 : 0
  const isFullStd = Number(q.isFullStdGame ?? 1) ? 1 : 0
  const isAuto = Number(q.isAuto ?? 0) ? 1 : 0
  const relicGameId =
    q.relicGameId && !['null', ''].includes(String(q.relicGameId).toLowerCase())
      ? Number(q.relicGameId)
      : null

  const players: string[] = []
  const races: number[] = []
  const winners: number[] = []
  const sids: string[] = []
  let fullSids = true
  for (let i = 1; i <= type * 2; i++) {
    races.push(Number(q[`r${i}`] || 0) || 0)
    players.push(b64DecodeSafe((q[`p${i}`] || '').toString()))
    winners.push(i <= type ? Number(q[`w${i}`] || 0) || 0 : 0)
    const sidN = (q[`sid${i}`] || '').toString()
    sids.push(/^\d{17}$/.test(sidN) ? sidN : '')
    if (!sids[i - 1]) fullSids = false
  }

  if (sids[0] && sids[0] === sids[1]) {
    return { ok: true, gameId: null, skipped: 'duplicate_sid_guard' }
  }

  const isLeaver = winby === 'disconnect'
  const nowIso = new Date().toISOString()
  const DTimeMAX = new Date(Date.now() - 1800_000).toISOString()

  // Resolve modId
  let modId = 1
  const modRow = await db.query.mods.findFirst({
    where: eq(tables.mods.technicalName, modTech),
    columns: { id: true, technicalName: true },
  })
  if (modRow?.id) modId = modRow.id

  // Resolve active season
  let seasonId = 1
  const seasonRow = await db.query.seasons.findFirst({
    where: eq(tables.seasons.isActive, 1),
    orderBy: [desc(tables.seasons.id)],
    columns: { id: true },
  })
  if (seasonRow?.id) seasonId = seasonRow.id

  // Ensure players exist and have players_stats rows
  if (sids.some(Boolean)) {
    // create missing players
    const inDb = await db.query.players.findMany({
      where: inArray(
        tables.players.sid,
        sids.filter(Boolean).map((x) => BigInt(x))
      ),
      columns: { sid: true },
    })
    const have = new Set(inDb.map((p) => String(p.sid)))
    const missing = sids.filter((sid) => sid && !have.has(sid))
    if (missing.length) {
      const steamProfiles = await fetchSteamProfiles(missing)
      for (const msid of missing) {
        const sp = steamProfiles[msid]
        const picked = sp ? pickAvatars(sp) : undefined
        await db
          .insert(tables.players)
          .ignore()
          .values({
            sid: BigInt(msid),
            name: sp?.personaname || msid,
            avatarUrl: picked?.medium || picked?.small || '/images/default_avatar.jpg',
            avatarUrlBig:
              picked?.full || picked?.medium || picked?.small || '/images/default_avatar.jpg',
            apm: 0,
            lastUpdateTime: nowIso,
          })
      }
    }
    // ensure players_stats rows exist
    const playersRows = await db.query.players.findMany({
      where: inArray(
        tables.players.sid,
        sids.filter(Boolean).map((x) => BigInt(x))
      ),
      columns: { id: true, sid: true },
    })
    for (const pr of playersRows) {
      await db.insert(tables.playersStats).ignore().values({
        playerId: pr.id,
        seasonId,
        modId,
        mmr: 1500,
        overallMmr: 1500,
        maxMmr: 1500,
        maxOverallMmr: 1500,
        customGamesMmr: 1500,
      })
    }
  }

  // Build same-game condition (approximation of PHP) using parameterized SQL
  const condParts: Array<ReturnType<typeof sql>> = []
  for (let i = 1; i <= type * 2; i++) {
    const p = players[i - 1]
    const r = races[i - 1]
    if (p) condParts.push(sql`(${sql.raw(`p${i}`)} = ${p} OR ${sql.raw(`p${i}`)} = '')`)
    condParts.push(sql`${sql.raw(`r${i}`)} = ${r}`)
  }

  const baseWhere = sql`${sql.raw('map')} = ${map} AND ${sql.raw('cTime')} > ${DTimeMAX} AND ${sql.raw('gTime')} = ${gTime}`
  const fullWhere = condParts.length
    ? sql`${sql.join(condParts, sql` AND `)} AND ${baseWhere}`
    : baseWhere
  const matched = await db.execute(
    sql`SELECT * FROM games WHERE ${fullWhere} ORDER BY id DESC LIMIT 1`
  )

  let gameId: number | null = null
  let matchedByRelic = false
  if (isDowde && relicGameId != null) {
    const byRelic = await db.execute(
      sql`SELECT * FROM games WHERE relic_game_id = ${relicGameId} AND game_mod = 'dowde' ORDER BY id DESC LIMIT 1`
    )
    if (Array.isArray(byRelic) && (byRelic as any).length) {
      const row = (byRelic as any)[0]
      gameId = Number(row.id)
      matchedByRelic = true
    }
  }
  if (gameId == null && Array.isArray(matched) && (matched as any).length) {
    gameId = Number((matched as any)[0].id)
  }

  // Determine sender index
  const senderIndex0 = sids.indexOf(sidSender)
  const senderIndex = senderIndex0 === -1 ? 0 : senderIndex0 + 1

  // Update APM for sender
  if (apm > 0 && senderIndex) {
    const playerRow = await db.query.players.findFirst({
      where: eq(tables.players.sid, BigInt(sidSender)),
      columns: { id: true, apm: true, apmGameCounter: true },
    })
    if (playerRow) {
      const curApm = Number(playerRow.apm || 0)
      const curCounter = Number(playerRow.apmGameCounter || 0)
      const apmNew = (curApm * curCounter + apm) / (curCounter + 1)
      await db
        .update(tables.players)
        .set({ apm: apmNew, apmGameCounter: curCounter + 1 })
        .where(eq(tables.players.id, playerRow.id))
    }
  }

  // Helper to read snapshot mmr value for a sid
  async function fetchMmrSnapshot(sidStr: string): Promise<number | null> {
    if (!sidStr) return null
    const row = await db
      .select({
        mmr: tables.playersStats.mmr,
        overallMmr: tables.playersStats.overallMmr,
        custom: tables.playersStats.customGamesMmr,
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
      .where(eq(tables.players.sid, BigInt(sidStr)))
    if (!row.length) return null
    const r = row[0]
    if (isDowde) {
      if (isAuto) return type === 1 ? Number(r.mmr || 0) : Number(r.overallMmr || 0)
      return Number(r.custom ?? ((type === 1 ? r.mmr : r.overallMmr) || 0))
    }
    return type === 1 ? Number(r.mmr || 0) : Number(r.overallMmr || 0)
  }

  // Update existing game or insert new game
  const statsendsid: Record<number, string> = {}
  if (senderIndex) statsendsid[senderIndex] = sidSender

  let justConfirmed = false
  let wasInserted = false
  if (gameId != null) {
    // Existing game: update fields and optionally confirm
    const updates: Partial<typeof tables.games.$inferInsert> = {}
    for (let i = 1; i <= type * 2; i++) {
      if (sids[i - 1]) (updates as any)[`sid${i}`] = sids[i - 1]
      if (!matchedByRelic && i <= type) (updates as any)[`w${i}`] = winners[i - 1] || null
    }
    if (senderIndex) (updates as any)[`apm${senderIndex}R`] = apm
    updates.gTime = gTime
    updates.statsendsid = Buffer.from(JSON.stringify(statsendsid)).toString('base64')
    updates.relic_game_id = relicGameId

    // If not confirmed and not leaver: set mmr snapshots, rank and confirm
    const existing = await db.query.games.findFirst({
      where: eq(tables.games.id, gameId),
      columns: { confirmed: true },
    })
    const setConfirm = existing && Number(existing.confirmed || 0) === 0 && !isLeaver
    if (setConfirm) {
      let minMmr = 10000
      for (let i = 1; i <= type * 2; i++) {
        const m = await fetchMmrSnapshot(sids[i - 1])
        if (m != null) {
          ;(updates as any)[`mmr${i}`] = m
          if (m < minMmr) minMmr = m
        }
      }
      if (type === 1) {
        const gameRank = await getRankByMmr(db, minMmr, modId, seasonId)
        updates.rankColumn = gameRank
      }
      updates.isAuto = isAuto
      updates.confirmed = 1
      justConfirmed = true
    } else {
      updates.isAuto = isAuto
    }

    await db.update(tables.games).set(updates).where(eq(tables.games.id, gameId))
  } else {
    // Insert new game
    const insertValues: typeof tables.games.$inferInsert = {
      type,
      gameMod: modTech,
      modVersion,
      map,
      gTime,
      cTime: nowIso,
      statsendsid: Buffer.from(JSON.stringify(statsendsid)).toString('base64'),
      ipreal: '',
      isExistBanUser: 0,
      isFullStd: isFullStd,
      seasonId,
      isRate: isRanked,
      relic_game_id: relicGameId ?? undefined,
      isAuto,
      // Ensure required MMR snapshot fields are always present
      mmr1: 1500,
      mmr2: 1500,
      mmr3: 1500,
      mmr4: 1500,
      mmr5: 1500,
      mmr6: 1500,
      mmr7: 1500,
      mmr8: 1500,
    }
    for (let i = 1; i <= type * 2; i++) {
      if (sids[i - 1]) (insertValues as any)[`sid${i}`] = sids[i - 1]
      ;(insertValues as any)[`p${i}`] = players[i - 1]
    }
    for (let i = 1; i <= type; i++) {
      if (winners[i - 1]) (insertValues as any)[`w${i}`] = winners[i - 1]
    }
    for (let i = 1; i <= type * 2; i++) {
      ;(insertValues as any)[`r${i}`] = races[i - 1]
    }
    if (senderIndex) (insertValues as any)[`apm${senderIndex}R`] = apm

    // Fill MMR snapshots for all slots; keep defaults when missing
    let minMmr = 10000
    for (let i = 1; i <= type * 2; i++) {
      const m = await fetchMmrSnapshot(sids[i - 1])
      if (m != null) {
        ;(insertValues as any)[`mmr${i}`] = m
        if (m < minMmr) minMmr = m
      }
    }
    if (!isLeaver) {
      if (type === 1) insertValues.rankColumn = await getRankByMmr(db, minMmr, modId, seasonId)
      insertValues.confirmed = 1
    } else {
      insertValues.confirmed = 0
    }

    const res = await db.insert(tables.games).values(insertValues)
    gameId = Number((res as any)?.insertId || 0)
    wasInserted = true
  }

  // Save replay from GET: usually absent; noop here. POST endpoint handles raw replay.

  // After game recorded: update ranks min/max
  if (justConfirmed || wasInserted) {
    try {
      await applyEloAndCounters({
        sids,
        winners,
        races,
        type,
        gTime,
        seasonId,
        modId,
        isRanked,
        isFullStd: isFullStd,
        isAuto,
        isDowde,
      })
    } catch {
      // keep endpoint resilient
    }
  }
  await updateRanksMinAndMax(db, modId, seasonId)

  return { ok: true, gameId }
})

import {
  defineEventHandler,
  getQuery,
  getHeader,
  createError,
  readRawBody,
  readMultipartFormData,
} from 'h3'
import { and, eq, desc, inArray } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'
import { updateRanksMinAndMax, getRankByMmr } from '~~/server/utils/ranks'
import { fetchSteamProfiles, pickAvatars } from '~~/server/utils/steam'
import { makeReplayKey, uploadReplay } from '~~/server/utils/s3'
import { applyEloAndCounters } from '~~/server/utils/game-updates'
import fs from 'node:fs'
import path from 'node:path'

defineRouteMeta({
  openAPI: {
    description:
      'Миграция send_replay5.php (POST). Обрабатывает параметры игры и принимает бинарный реплей (multipart или octet-stream), сохраняет в S3 и обновляет games.replay_link.',
    security: [{ ApiKeyAuth: [] }],
    requestBody: {
      content: {
        'application/octet-stream': { schema: { type: 'string', format: 'binary' } },
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
          },
        },
      },
    },
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

  let authOk = false
  const configSecret = process.env.NUXT_API_SECRET
  let fileSecret = ''
  if (!configSecret) {
    try {
      const iniPath = path.resolve(process.cwd(), '../dowstats.ini')
      if (fs.existsSync(iniPath)) {
        const content = fs.readFileSync(iniPath, 'utf-8')
        const match = content.match(/api_secret\s*=\s*["']?([^"'\n]+)["']?/)
        if (match) {
          fileSecret = match[1]
        }
      }
    } catch {}
  }
  const secret = configSecret || fileSecret
  if (!secret) {
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
    if (!authOk && q.api_secret === secret) {
      authOk = true
    }
  }
  if (!authOk) {
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

  const isLeaver = winby === 'disconnect'
  const nowIso = new Date().toISOString()

  // Resolve modId/seasonId
  let modId = 1
  const modRow = await db.query.mods.findFirst({
    where: eq(tables.mods.technicalName, modTech),
    columns: { id: true },
  })
  if (modRow?.id) modId = modRow.id
  let seasonId = 1
  const seasonRow = await db.query.seasons.findFirst({
    where: eq(tables.seasons.isActive, 1),
    orderBy: [desc(tables.seasons.id)],
    columns: { id: true },
  })
  if (seasonRow?.id) seasonId = seasonRow.id

  // Ensure players & stats exist
  if (sids.some(Boolean)) {
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

  // Determine sender index & APM update
  const senderIndex0 = sids.indexOf(sidSender)
  const senderIndex = senderIndex0 === -1 ? 0 : senderIndex0 + 1
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

  // Insert new game (POST is primary for replay upload)
  const statsendsid: Record<number, string> = {}
  if (senderIndex) statsendsid[senderIndex] = sidSender
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
    // Ensure required MMR snapshot fields are present
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
  for (let i = 1; i <= type * 2; i++) (insertValues as any)[`r${i}`] = races[i - 1]
  if (senderIndex) (insertValues as any)[`apm${senderIndex}R`] = apm

  if (!isLeaver) {
    let minMmr = 10000
    const fetch = async (sidStr: string): Promise<number | null> => {
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
    for (let i = 1; i <= type * 2; i++) {
      const m = await fetch(sids[i - 1])
      if (m != null) {
        ;(insertValues as any)[`mmr${i}`] = m
        if (m < minMmr) minMmr = m
      }
    }
    if (type === 1) insertValues.rankColumn = await getRankByMmr(db, minMmr, modId, seasonId)
    insertValues.confirmed = 1
  } else {
    insertValues.confirmed = 0
  }

  const res = await db.insert(tables.games).values(insertValues)
  const gameId = Number((res as any)?.insertId || 0)

  // Read replay (multipart or octet-stream)
  let data: Buffer | null = null
  const ct = (getHeader(event, 'content-type') || '').toLowerCase()
  if (ct.includes('multipart/form-data')) {
    const parts = await readMultipartFormData(event)
    const file = parts?.find((p) => p.name === 'file' && p.type === 'file')
    if (file?.data) data = file.data as Buffer
  } else {
    const raw = await readRawBody(event)
    if (raw && raw.length > 0) data = Buffer.from(raw)
  }

  if (data && data.length > 0 && gameId) {
    const originalName = map ? `${map}.rec` : `replay.rec`
    const key = makeReplayKey(originalName, gameId)
    try {
      await uploadReplay(key, data)
      const link = `/api/v1/replays/${encodeURIComponent(key)}`
      await db.update(tables.games).set({ replayLink: link }).where(eq(tables.games.id, gameId))
    } catch (e) {
      // swallow errors to not fail stats
    }
  }

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
  } catch (e) {
    // swallow errors; keep endpoint resilient
  }
  await updateRanksMinAndMax(db, modId, seasonId)

  return { ok: true, gameId }
})

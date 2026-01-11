import { and, eq, inArray, sql } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

// MySQL column names for counters are like '1x1_1' and '1x1_1w'
function statCol(type: number, race: number): string {
  return `${type}x${type}_${race}`
}
function statWinCol(type: number, race: number): string {
  return `${type}x${type}_${race}w`
}

export async function applyEloAndCounters(params: {
  sids: string[]
  winners: number[]
  races: number[]
  type: number
  gTime: number
  seasonId: number
  modId: number
  isRanked: number
  isFullStd: number
  isAuto: number
  isDowde: boolean
}) {
  const {
    sids,
    winners,
    races,
    type,
    gTime,
    seasonId,
    modId,
    isRanked,
    isFullStd,
    isAuto,
    isDowde,
  } = params

  const db = useDrizzle()
  const n = type * 2
  const K = 60 - 5 * n

  const allSidsPresent = sids.every((s) => !!s)
  let changeMmr = allSidsPresent && !!isRanked
  const applyAutoMmr = changeMmr && (!isDowde || !!isAuto)
  const changeCustom = changeMmr && isDowde

  // Fetch all player rows with stats
  const rows = await db
    .select({
      sid: tables.players.sid,
      id: tables.players.id,
      mmr: tables.playersStats.mmr,
      overallMmr: tables.playersStats.overallMmr,
      custom: tables.playersStats.customGamesMmr,
      maxMmr: tables.playersStats.maxMmr,
      maxOverallMmr: tables.playersStats.maxOverallMmr,
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
    .where(
      inArray(
        tables.players.sid,
        sids.filter(Boolean).map((x) => BigInt(x))
      )
    )

  const bySid = new Map<string, (typeof rows)[0]>()
  for (const r of rows) bySid.set(String(r.sid), r)

  const mmrChanges: Record<string, number> = {}
  const overallChanges: Record<string, number> = {}
  const customChanges: Record<string, number> = {}
  const maxMmrChanges: Record<string, number> = {}
  const maxOverallChanges: Record<string, number> = {}

  if (changeMmr) {
    for (let i = 0; i < n; i++) {
      const sidI = sids[i]
      if (!sidI) continue
      const rowI = bySid.get(sidI)
      if (!rowI) continue
      const resultI = winners.includes(i + 1)
      let curElo = Number(rowI.mmr ?? 1500)
      let overallCur = Number(rowI.overallMmr ?? 1500)
      let customCur = Number(rowI.custom ?? 1500)
      let eloDelta = 0
      let overallDelta = 0
      let customDelta = 0
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const sidJ = sids[j]
        if (!sidJ) continue
        const rowJ = bySid.get(sidJ)
        if (!rowJ) continue
        const resultJ = winners.includes(j + 1)
        if (resultI === resultJ) continue
        if (applyAutoMmr) {
          const EAo = 1 / (1 + Math.pow(10, (Number(rowJ.overallMmr ?? 1500) - overallCur) / 400))
          const changeOverall = Math.round(K * ((resultI ? 1 : 0) - EAo))
          overallDelta += changeOverall
          if (type === 1) {
            const EA = 1 / (1 + Math.pow(10, (Number(rowJ.mmr ?? 1500) - curElo) / 400))
            const change = Math.round(K * ((resultI ? 1 : 0) - EA))
            eloDelta += change
          }
        }
        if (changeCustom) {
          const EAc = 1 / (1 + Math.pow(10, (Number(rowJ.custom ?? 1500) - customCur) / 400))
          const change = Math.round(K * ((resultI ? 1 : 0) - EAc))
          customDelta += change
        }
      }
      if (applyAutoMmr) {
        overallCur += overallDelta
        overallChanges[sidI] = overallCur
        const prevMaxOverall = Number(rowI.maxOverallMmr ?? overallCur)
        if (overallCur > prevMaxOverall) maxOverallChanges[sidI] = overallCur
        if (type === 1) {
          curElo += eloDelta
          mmrChanges[sidI] = curElo
          const prevMax = Number(rowI.maxMmr ?? curElo)
          if (curElo > prevMax) maxMmrChanges[sidI] = curElo
        }
      }
      if (changeCustom) {
        customCur += customDelta
        customChanges[sidI] = customCur
      }
    }
  }

  // Persist changes
  if (type === 1 && isFullStd && applyAutoMmr) {
    for (const [sid, value] of Object.entries(mmrChanges)) {
      const rowI = bySid.get(sid)
      if (!rowI?.id) continue
      const setObj: Record<string, any> = { mmr: Math.round(value) }
      const maybeMax = maxMmrChanges[sid]
      if (maybeMax != null) setObj.maxMmr = Math.round(maybeMax)
      await db
        .update(tables.playersStats)
        .set(setObj)
        .where(
          and(
            eq(tables.playersStats.playerId, rowI.id),
            eq(tables.playersStats.modId, modId),
            eq(tables.playersStats.seasonId, seasonId)
          )
        )
    }
  }
  for (const [sid, value] of Object.entries(overallChanges)) {
    const rowI = bySid.get(sid)
    if (!rowI?.id) continue
    const setObj: Record<string, any> = { overallMmr: Math.round(value) }
    const maybeMax = maxOverallChanges[sid]
    if (maybeMax != null) setObj.maxOverallMmr = Math.round(maybeMax)
    await db
      .update(tables.playersStats)
      .set(setObj)
      .where(
        and(
          eq(tables.playersStats.playerId, rowI.id),
          eq(tables.playersStats.modId, modId),
          eq(tables.playersStats.seasonId, seasonId)
        )
      )
  }
  for (const [sid, value] of Object.entries(customChanges)) {
    const rowI = bySid.get(sid)
    if (!rowI?.id) continue
    await db
      .update(tables.playersStats)
      .set({ customGamesMmr: Math.round(value) })
      .where(
        and(
          eq(tables.playersStats.playerId, rowI.id),
          eq(tables.playersStats.modId, modId),
          eq(tables.playersStats.seasonId, seasonId)
        )
      )
  }

  // Update per-race counters and players time/last_active
  const lastActiveIso = new Date().toISOString()
  for (let i = 0; i < n; i++) {
    const sidI = sids[i]
    if (!sidI) continue
    const rowI = bySid.get(sidI)
    if (!rowI?.id) continue
    const col = statCol(type, races[i])
    const winCol = statWinCol(type, races[i])
    const winInc = winners.includes(i + 1) ? 1 : 0
    await db.execute(
      sql`UPDATE players_stats SET ${sql.raw(col)} = ${sql.raw(col)} + 1, ${sql.raw(
        winCol
      )} = ${sql.raw(winCol)} + ${winInc} WHERE player_id=${rowI.id} AND mod_id=${modId} AND season_id=${seasonId}`
    )

    await db
      .update(tables.players)
      .set({ lastActive: lastActiveIso, time: sql`${tables.players.time} + ${gTime}` })
      .where(eq(tables.players.id, rowI.id))
  }
}

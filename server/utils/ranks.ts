import { and, eq, sql } from 'drizzle-orm'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

export const MIN_MMR = 1400
export const MAX_MMR = 1600

export interface RankInterval {
  min: number
  max: number
}

export function computeRankIntervals(minMmr: number, maxMmr: number): Record<number, RankInterval> {
  const min = Math.max(0, Math.floor(minMmr))
  const max = Math.max(min + 1, Math.floor(maxMmr))
  const interval = Math.floor((max - min) / 7 + 1)
  const map: Record<number, RankInterval> = {} as any
  let intervalNumber = 1
  for (let i = 7; i > 0; i--) {
    map[i] = {
      min: min + interval * (intervalNumber - 1),
      max: min + interval * intervalNumber - 1,
    }
    intervalNumber++
  }
  return map
}

export async function loadMinMaxMmr(
  db: ReturnType<typeof useDrizzle>,
  modId: number,
  seasonId: number
): Promise<{ min: number; max: number }> {
  const rows = await db
    .select({
      max: sql<number>`MAX(${tables.playersStats.mmr})`,
      min: sql<number>`MIN(${tables.playersStats.mmr})`,
    })
    .from(tables.playersStats)
    .where(and(eq(tables.playersStats.modId, modId), eq(tables.playersStats.seasonId, seasonId)))

  const maxRaw = Number(rows[0]?.max ?? 0)
  const minRaw = Number(rows[0]?.min ?? 0)
  const min = minRaw < MIN_MMR ? minRaw : MIN_MMR
  const max = maxRaw > MAX_MMR ? maxRaw : MAX_MMR
  return { min, max }
}

export async function updateRanksMinAndMax(
  db: ReturnType<typeof useDrizzle>,
  modId: number,
  seasonId: number
) {
  const { min, max } = await loadMinMaxMmr(db, modId, seasonId)
  await db
    .insert(tables.minMaxRanks)
    .values({ seasonId, modId, minMmr: min, maxMmr: max })
    .onDuplicateKeyUpdate({ set: { minMmr: min, maxMmr: max } })
}

export async function getRankByMmr(
  db: ReturnType<typeof useDrizzle>,
  mmr: number,
  modId: number,
  seasonId: number
): Promise<number> {
  const mm = await db.query.minMaxRanks.findFirst({
    where: and(eq(tables.minMaxRanks.modId, modId), eq(tables.minMaxRanks.seasonId, seasonId)),
    columns: { minMmr: true, maxMmr: true },
  })
  const baseMin = mm?.minMmr ?? MIN_MMR
  const baseMax = mm?.maxMmr ?? MAX_MMR
  const intervals = computeRankIntervals(baseMin, baseMax)
  for (let i = 7; i > 0; i--) {
    const it = intervals[i]
    if (mmr >= it.min && mmr <= it.max) return i
  }
  return 7
}

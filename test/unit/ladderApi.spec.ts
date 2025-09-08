/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as schema from '../../server/database/schema'
import type { MmrType } from '../../app/types/ladder'

// Mock drizzle utils module so that anything importing it won't reach server/db.ts
vi.mock('../../server/utils/drizzle', () => ({
  tables: schema,
  useDrizzle: vi.fn(),
}))

// Create a lightweight fake DB that returns queued results for any awaited chain
function createFakeDb(responses: Array<Record<string, unknown>[]>) {
  const queue = [...responses]
  const chain: any = {
    from() {
      return chain
    },
    innerJoin() {
      return chain
    },
    where() {
      return chain
    },
    orderBy() {
      return chain
    },
    limit() {
      return chain
    },
    offset() {
      return chain
    },
    groupBy() {
      return chain
    },
    select() {
      return chain
    },
    then(resolve: (value: unknown) => unknown) {
      const res = queue.shift() ?? []
      return resolve(res)
    },
    catch() {
      return chain
    },
    finally(cb?: () => void) {
      if (cb) cb()
      return chain
    },
  }
  return { select: () => chain }
}

// Helpers to (re)import the handler after stubbing globals
async function importHandler() {
  // dynamic import AFTER globals are set so top-level calls don't fail
  const mod = await import('../../server/api/v1/ladder/index.get')
  return mod.default as (event: unknown) => Promise<any>
}

beforeEach(async () => {
  vi.resetModules()
  vi.unstubAllGlobals()

  // Minimal Nitro/Nuxt server globals used by the handler
  vi.stubGlobal('defineEventHandler', (fn: any) => fn)
  vi.stubGlobal('defineRouteMeta', (_: any) => void 0)
  vi.stubGlobal('getQuery', (event: any) => event?.query ?? {})

  // Expose tables to mimic Nuxt auto-import
  vi.stubGlobal('tables', schema)

  // Dynamically import real parameter helpers after mocking drizzle
  const lp = await import('../../server/utils/ladderParams')
  vi.stubGlobal('parseModId', lp.parseModId)
  vi.stubGlobal('parseMmrType', lp.parseMmrType)
  vi.stubGlobal('parseSort', lp.parseSort)
  vi.stubGlobal('parseServerId', lp.parseServerId)
  vi.stubGlobal('parsePagination', lp.parsePagination)
  vi.stubGlobal('parseProvidedSeason', lp.parseProvidedSeason)
  vi.stubGlobal('parseMinGames', lp.parseMinGames)
  vi.stubGlobal('buildSearchCondition', lp.buildSearchCondition)
  vi.stubGlobal('getTotalGamesExpr', lp.getTotalGamesExpr as any)
  vi.stubGlobal('getTotalWinsExpr', lp.getTotalWinsExpr as any)
})

describe('GET /api/v1/ladder - handler', () => {
  it('returns empty payload when season cannot be resolved', async () => {
    // Season cannot be resolved
    vi.stubGlobal('resolveSeasonId', async () => null)

    // DB will not be used, but set anyway
    vi.stubGlobal('useDrizzle', () => createFakeDb([]))

    const handler = await importHandler()

    const res = await handler({ query: { mod: '1' } })

    expect(res).toEqual({
      items: [],
      meta: expect.objectContaining({
        modId: 1,
        seasonId: null,
        mmrType: 'solo',
        sort: 'desc',
        page: 1,
        pageSize: 25,
        total: 0,
        totalPages: 0,
      }),
    })
  })

  it('builds solo ladder with ranks, favorite race and totals', async () => {
    // Force a valid season id
    vi.stubGlobal('resolveSeasonId', async () => 10)

    // Queue results in the order queries are awaited in the handler:
    // 1) totalRows (count)
    // 2) rows (players page)
    // 3) dist (mmr distribution for rank calc)
    // 4) raceRows (names for favorites)
    // 5) totals (games/wins per player)
    const db = createFakeDb([
      // 1) totalRows
      [{ count: 2 }],
      // 2) rows: two players
      [
        {
          playerId: 1,
          name: 'Alice',
          avatarUrl: 'a.png',
          mmr: 1500,
          g1: 1,
          g2: 10,
          g3: 2,
          g4: 0,
          g5: 0,
          g6: 0,
          g7: 0,
          g8: 0,
          g9: 0,
        },
        {
          playerId: 2,
          name: 'Bob',
          avatarUrl: 'b.png',
          mmr: 1400,
          g1: 0,
          g2: 0,
          g3: 7,
          g4: 1,
          g5: 0,
          g6: 0,
          g7: 0,
          g8: 0,
          g9: 0,
        },
      ],
      // 3) dist for ranks (>= minMmrOnPage which is 1400)
      [
        { mmr: 1500, cnt: 1 },
        { mmr: 1400, cnt: 1 },
      ],
      // 4) race rows: favorites are race 2 (Alice) and race 3 (Bob)
      [
        { id: 2, name: 'Eldar', shortName: 'EL' },
        { id: 3, name: 'Orks', shortName: 'OR' },
      ],
      // 5) totals for players 1 and 2
      [
        { playerId: 1, games: 100, wins: 55 },
        { playerId: 2, games: 20, wins: 10 },
      ],
    ])

    vi.stubGlobal('useDrizzle', () => db)

    const handler = await importHandler()

    const res = await handler({ query: { mod: '1', mmrType: 'solo' } })

    expect(res.meta).toEqual({
      modId: 1,
      seasonId: 10,
      mmrType: 'solo',
      sort: 'desc',
      page: 1,
      pageSize: 25,
      total: 2,
      totalPages: 1,
    })

    expect(res.items).toHaveLength(2)

    // Sorted by MMR desc
    expect(res.items[0]).toEqual({
      rank: 1,
      playerId: 1,
      name: 'Alice',
      avatarUrl: 'a.png',
      mmr: 1500,
      games: 100,
      wins: 55,
      winrate: 55,
      favoriteRaceId: 2,
      favoriteRaceName: 'Eldar',
      favoriteRaceShortName: 'EL',
    })

    expect(res.items[1]).toEqual({
      rank: 2,
      playerId: 2,
      name: 'Bob',
      avatarUrl: 'b.png',
      mmr: 1400,
      games: 20,
      wins: 10,
      winrate: 50,
      favoriteRaceId: 3,
      favoriteRaceName: 'Orks',
      favoriteRaceShortName: 'OR',
    })
  })

  it('builds team ladder and computes favorites from team columns', async () => {
    vi.stubGlobal('resolveSeasonId', async () => 42)

    const db = createFakeDb([
      // total
      [{ count: 1 }],
      // rows (team): use aX and bX/cX to force favorite race 5
      [
        {
          playerId: 3,
          name: 'Cara',
          avatarUrl: null,
          mmr: 1600,
          a1: 0,
          a2: 0,
          a3: 0,
          a4: 0,
          a5: 3,
          a6: 0,
          a7: 0,
          a8: 0,
          a9: 0,
          b1: 0,
          b2: 0,
          b3: 0,
          b4: 0,
          b5: 2,
          b6: 0,
          b7: 0,
          b8: 0,
          b9: 0,
          c1: 0,
          c2: 0,
          c3: 0,
          c4: 0,
          c5: 1,
          c6: 0,
          c7: 0,
          c8: 0,
          c9: 0,
        },
      ],
      // dist
      [{ mmr: 1600, cnt: 1 }],
      // race rows (race 5)
      [{ id: 5, name: 'Imperial Guard', shortName: 'IG' }],
      // totals
      [{ playerId: 3, games: 6, wins: 3 }],
    ])

    vi.stubGlobal('useDrizzle', () => db)

    const handler = await importHandler()

    const res = await handler({ query: { mod: '2', mmrType: 'team' as MmrType } })

    expect(res.meta.seasonId).toBe(42)
    expect(res.meta.mmrType).toBe('team')
    expect(res.items).toEqual([
      {
        rank: 1,
        playerId: 3,
        name: 'Cara',
        avatarUrl: null,
        mmr: 1600,
        games: 6,
        wins: 3,
        winrate: 50,
        favoriteRaceId: 5,
        favoriteRaceName: 'Imperial Guard',
        favoriteRaceShortName: 'IG',
      },
    ])
  })
})

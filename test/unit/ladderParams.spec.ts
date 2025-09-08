/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeAll } from 'vitest'
import * as schema from '../../server/database/schema'

// Mock drizzle utils to avoid importing real db.ts (which requires useRuntimeConfig)
vi.mock('../../server/utils/drizzle', () => ({
  tables: schema,
  useDrizzle: vi.fn(),
}))

let parseModId: any,
  parseMmrType: any,
  parseSort: any,
  parseServerId: any,
  parsePagination: any,
  parseMinGames: any,
  parseProvidedSeason: any,
  buildSearchCondition: any,
  resolveSeasonId: any

beforeAll(async () => {
  const mod = await import('../../server/utils/ladderParams')
  parseModId = (mod as any).parseModId
  parseMmrType = (mod as any).parseMmrType
  parseSort = (mod as any).parseSort
  parseServerId = (mod as any).parseServerId
  parsePagination = (mod as any).parsePagination
  parseMinGames = (mod as any).parseMinGames
  parseProvidedSeason = (mod as any).parseProvidedSeason
  buildSearchCondition = (mod as any).buildSearchCondition
  resolveSeasonId = (mod as any).resolveSeasonId
})

// Minimal fake DB to satisfy resolveSeasonId queries
function createFakeDb(responses: Array<any[]> = []) {
  const queue = [...responses]
  const chain = {
    from() {
      return this
    },
    where() {
      return this
    },
    orderBy() {
      return this
    },
    limit() {
      // return next queued response
      return Promise.resolve(queue.shift() ?? [])
    },
  }
  return {
    select() {
      return chain
    },
  }
}

describe('ladderParams: parseModId', () => {
  it('parses valid mod id', () => {
    expect(parseModId({ mod: '1' } as any)).toBe(1)
    expect(parseModId({ mod: 5 } as any)).toBe(5)
  })

  it('throws on missing or invalid mod id', () => {
    expect(() => parseModId({} as any)).toThrowError(/mod/i)
    expect(() => parseModId({ mod: 'abc' } as any)).toThrowError(/mod/i)
    expect(() => parseModId({ mod: 0 } as any)).toThrowError(/mod/i)
  })
})

describe('ladderParams: parseMmrType', () => {
  it('accepts solo and team (case-insensitive)', () => {
    expect(parseMmrType({} as any)).toBe('solo')
    expect(parseMmrType({ mmrType: 'team' } as any)).toBe('team')
    expect(parseMmrType({ mmrType: 'SoLo' } as any)).toBe('solo')
  })

  it('throws on invalid mmrType', () => {
    expect(() => parseMmrType({ mmrType: 'duo' as any })).toThrowError(/mmrType/i)
  })
})

describe('ladderParams: parseSort', () => {
  it('defaults to desc and accepts asc', () => {
    expect(parseSort({} as any)).toBe('desc')
    expect(parseSort({ sort: 'asc' } as any)).toBe('asc')
    expect(parseSort({ sort: 'DESC' } as any)).toBe('desc')
  })
})

describe('ladderParams: parseServerId', () => {
  it('parses valid positive integer or undefined', () => {
    expect(parseServerId({} as any)).toBeUndefined()
    expect(parseServerId({ server: '2' } as any)).toBe(2)
  })

  it('throws on invalid values', () => {
    expect(() => parseServerId({ server: '0' } as any)).toThrowError(/server/i)
    expect(() => parseServerId({ server: '-1' } as any)).toThrowError(/server/i)
    expect(() => parseServerId({ server: 'abc' } as any)).toThrowError(/server/i)
  })
})

describe('ladderParams: parsePagination', () => {
  it('applies defaults, clamps pageSize and computes offset', () => {
    expect(parsePagination({} as any)).toEqual({ page: 1, pageSize: 25, offset: 0 })
    expect(parsePagination({ page: '2', pageSize: '10' } as any)).toEqual({
      page: 2,
      pageSize: 10,
      offset: 10,
    })
    // Clamp pageSize to [1, 200]
    expect(parsePagination({ page: '1', pageSize: '0' } as any)).toEqual({
      page: 1,
      pageSize: 25,
      offset: 0,
    })
    expect(parsePagination({ page: '1', pageSize: '5000' } as any)).toEqual({
      page: 1,
      pageSize: 200,
      offset: 0,
    })
  })
})

describe('ladderParams: parseMinGames', () => {
  it('defaults to 1 and clamps to >= 0', () => {
    expect(parseMinGames({} as any)).toBe(1)
    expect(parseMinGames({ minGames: '5' } as any)).toBe(5)
    expect(parseMinGames({ minGames: '-3' } as any)).toBe(0)
    expect(parseMinGames({ minGames: 'abc' } as any)).toBe(1)
  })
})

describe('ladderParams: parseProvidedSeason', () => {
  it('parses valid positive integer or undefined', () => {
    expect(parseProvidedSeason({} as any)).toBeUndefined()
    expect(parseProvidedSeason({ season: '3' } as any)).toBe(3)
  })

  it('throws on invalid values', () => {
    expect(() => parseProvidedSeason({ season: '0' } as any)).toThrowError(/season/i)
    expect(() => parseProvidedSeason({ season: '-1' } as any)).toThrowError(/season/i)
    expect(() => parseProvidedSeason({ season: 'abc' } as any)).toThrowError(/season/i)
  })
})

describe('ladderParams: buildSearchCondition', () => {
  it('returns undefined for empty or whitespace', () => {
    expect(buildSearchCondition('')).toBeUndefined()
    expect(buildSearchCondition('   ')).toBeUndefined()
  })

  it('returns an SQL condition object for non-empty input', () => {
    const cond = buildSearchCondition('player')
    expect(cond).toBeDefined()
    // drizzle-orm SQL is an object; we can only assert type characteristics
    expect(typeof cond).toBe('object')
  })
})

describe('ladderParams: resolveSeasonId', () => {
  it('returns provided season id if it exists, otherwise null', async () => {
    // First response: seasonExists query result (found)
    const db1 = createFakeDb([[{ id: 7 }]])
    expect(await resolveSeasonId(db1 as any, 7)).toBe(7)

    // First response: seasonExists query result (not found)
    const db2 = createFakeDb([[]])
    expect(await resolveSeasonId(db2 as any, 9999)).toBeNull()
  })

  it('returns active season if present', async () => {
    // activeSeason query -> [{ id: 5 }]
    const db = createFakeDb([[{ id: 5 }]])
    expect(await resolveSeasonId(db as any, undefined)).toBe(5)
  })

  it('falls back to latest season when no active, or null when none', async () => {
    // activeSeason -> [] then latestSeason -> [{ id: 3 }]
    const db1 = createFakeDb([[], [{ id: 3 }]])
    expect(await resolveSeasonId(db1 as any, undefined)).toBe(3)

    // activeSeason -> [] then latestSeason -> []
    const db2 = createFakeDb([[], []])
    expect(await resolveSeasonId(db2 as any, undefined)).toBeNull()
  })
})

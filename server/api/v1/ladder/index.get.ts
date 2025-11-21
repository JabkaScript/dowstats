import { desc, asc, sql, and, eq, inArray, gte } from 'drizzle-orm'
import type { LadderQuery, WhereCondition, SoloRow, TeamRow } from '~~/server/interfaces/ladder'

defineRouteMeta({
  openAPI: {
    description:
      "Players ladder by MMR with support for name search, mod and rating type (solo/team) selection, sorting, server filter, and pagination. Each item also includes the player's favorite race (favoriteRaceId, favoriteRaceName, favoriteRaceShortName), total games, wins and winrate.",
    parameters: [
      {
        in: 'query',
        name: 'mod',
        required: true,
        description: 'Mod ID (mod_id) used to build the ladder',
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
      {
        in: 'query',
        name: 'mmrType',
        required: false,
        description: "Rating type: 'solo' or 'team' (default 'solo')",
        schema: { type: 'string', enum: ['solo', 'team'] },
      },
      {
        in: 'query',
        name: 'search',
        required: false,
        description: 'Search by player name or their recent nicknames',
        schema: { type: 'string' },
      },
      {
        in: 'query',
        name: 'sort',
        required: false,
        description: "Sort direction by MMR: 'desc' (default) or 'asc'",
        schema: { type: 'string', enum: ['asc', 'desc'] },
      },
      {
        in: 'query',
        name: 'server',
        required: false,
        description: 'Server ID (steam/dowonline)',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'page',
        required: false,
        description: 'Page number (>=1)',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'pageSize',
        required: false,
        description: 'Page size (1..200)',
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'minGames',
        required: false,
        description:
          'Minimum number of games not less than this value (>=), default 1. For solo uses 1X1X columns, for team uses NxNX columns.',
        schema: { type: 'integer', minimum: 0 },
      },
    ],
  },
})

export default defineEventHandler(async (event) => {
  const db = useDrizzle()

  const query = getQuery(event) as Partial<LadderQuery>

  // Parse and validate
  const modId = await parseModId(query, db)
  const mmrType = parseMmrType(query)
  const sortDir = parseSort(query)
  const search = (query.search || '').toString().trim().toLowerCase()
  const serverId = parseServerId(query)
  const { page, pageSize, offset } = parsePagination(query)
  const providedSeason = parseProvidedSeason(query)
  const minGames = parseMinGames(query)

  // Resolve season
  const seasonId = await resolveSeasonId(db, providedSeason)
  if (!seasonId) {
    return {
      items: [],
      meta: {
        modId,
        seasonId: null,
        mmrType,
        sort: sortDir,
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    }
  }

  // Pick MMR column by type
  const mmrCol = mmrType === 'solo' ? tables.playersStats.mmr : tables.playersStats.overallMmr

  // Total games and wins expr by ladder type
  const totalGamesExpr = getTotalGamesExpr(mmrType)
  const totalWinsExpr = getTotalWinsExpr(mmrType)

  // Build conditions
  const baseConditions: WhereCondition[] = [
    eq(tables.playersStats.seasonId, seasonId),
    eq(tables.playersStats.modId, modId),
  ]

  if (serverId) {
    baseConditions.push(eq(tables.players.serverId, serverId) as unknown as WhereCondition)
  }

  // Apply minimum games condition (part of base conditions)
  baseConditions.push(sql`${totalGamesExpr} >= ${minGames}` as unknown as WhereCondition)

  baseConditions.push(
    sql`NOT EXISTS (
      SELECT 1
      FROM players_banned pb
      WHERE pb.player_id = ${tables.playersStats.playerId}
        AND (
          (pb.date_start IS NULL OR pb.date_start <= CURRENT_DATE)
          AND (pb.date_end IS NULL OR pb.date_end >= CURRENT_DATE OR pb.date_end = '0000-00-00')
        )
    )` as unknown as WhereCondition
  )

  const searchCond = buildSearchCondition(search)
  const conditions: WhereCondition[] = searchCond ? [...baseConditions, searchCond] : baseConditions

  // Count total for pagination
  const totalRows = await (
    searchCond || serverId
      ? db
          .select({ count: sql<number>`COUNT(*)` })
          .from(tables.playersStats)
          .innerJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
      : db.select({ count: sql<number>`COUNT(*)` }).from(tables.playersStats)
  ).where(and(...conditions))

  const total = Number(totalRows?.[0]?.count || 0)
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)

  let rows: SoloRow[] | TeamRow[] = []

  if (mmrType === 'solo') {
    rows = (await db
      .select({
        playerId: tables.players.id,
        name: tables.players.name,
        avatarUrl: tables.players.avatarUrl,
        mmr: mmrCol,
        g1: tables.playersStats['1X11'],
        g2: tables.playersStats['1X12'],
        g3: tables.playersStats['1X13'],
        g4: tables.playersStats['1X14'],
        g5: tables.playersStats['1X15'],
        g6: tables.playersStats['1X16'],
        g7: tables.playersStats['1X17'],
        g8: tables.playersStats['1X18'],
        g9: tables.playersStats['1X19'],
      })
      .from(tables.playersStats)
      .innerJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
      .where(and(...conditions))
      .orderBy(sortDir === 'asc' ? asc(mmrCol) : desc(mmrCol))
      .limit(pageSize)
      .offset(offset)) as SoloRow[]
  } else {
    rows = (await db
      .select({
        playerId: tables.players.id,
        name: tables.players.name,
        avatarUrl: tables.players.avatarUrl,
        mmr: mmrCol,
        a1: tables.playersStats['2X21'],
        a2: tables.playersStats['2X22'],
        a3: tables.playersStats['2X23'],
        a4: tables.playersStats['2X24'],
        a5: tables.playersStats['2X25'],
        a6: tables.playersStats['2X26'],
        a7: tables.playersStats['2X27'],
        a8: tables.playersStats['2X28'],
        a9: tables.playersStats['2X29'],
        b1: tables.playersStats['3X31'],
        b2: tables.playersStats['3X32'],
        b3: tables.playersStats['3X33'],
        b4: tables.playersStats['3X34'],
        b5: tables.playersStats['3X35'],
        b6: tables.playersStats['3X36'],
        b7: tables.playersStats['3X37'],
        b8: tables.playersStats['3X38'],
        b9: tables.playersStats['3X39'],
        c1: tables.playersStats['4X41'],
        c2: tables.playersStats['4X42'],
        c3: tables.playersStats['4X43'],
        c4: tables.playersStats['4X44'],
        c5: tables.playersStats['4X45'],
        c6: tables.playersStats['4X46'],
        c7: tables.playersStats['4X47'],
        c8: tables.playersStats['4X48'],
        c9: tables.playersStats['4X49'],
      })
      .from(tables.playersStats)
      .innerJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
      .where(and(...conditions))
      .orderBy(sortDir === 'asc' ? asc(mmrCol) : desc(mmrCol))
      .limit(pageSize)
      .offset(offset)) as TeamRow[]
  }

  // Compute global rank (independent of search) based on MMR order within base conditions
  const rankByMmr = new Map<number, number>()
  if (rows.length > 0) {
    const mmrsOnPage = rows.map((r) => Number(r.mmr)).filter((v) => Number.isFinite(v)) as number[]
    if (mmrsOnPage.length) {
      const minMmrOnPage = Math.min(...mmrsOnPage)

      const dist = await (
        serverId
          ? db
              .select({
                mmr: mmrCol,
                cnt: sql<number>`COUNT(*)`,
              })
              .from(tables.playersStats)
              .innerJoin(tables.players, eq(tables.players.id, tables.playersStats.playerId))
          : db
              .select({
                mmr: mmrCol,
                cnt: sql<number>`COUNT(*)`,
              })
              .from(tables.playersStats)
      )
        .where(and(...baseConditions, gte(mmrCol, minMmrOnPage) as unknown as WhereCondition))
        .groupBy(mmrCol)
        .orderBy(desc(mmrCol))

      let prefix = 0
      for (const row of dist) {
        const m = Number(row.mmr)
        const c = Number(row.cnt || 0)
        rankByMmr.set(m, prefix + 1)
        prefix += c
      }
    }
  }

  // Compute favorite race per player for the current ladder slice using players_stats race counters
  const favoriteByPlayer = new Map<string, { raceId: number; games: number }>()
  let raceInfoMap = new Map<number, { name: string | null; shortName: string | null }>()

  if (rows.length > 0) {
    if (mmrType === 'solo') {
      for (const r of rows as SoloRow[]) {
        const pid = String(r.playerId)
        const counts = [r.g1, r.g2, r.g3, r.g4, r.g5, r.g6, r.g7, r.g8, r.g9]
        let best = { raceId: 0, games: -1 }
        for (let i = 0; i < counts.length; i++) {
          const games = Number(counts[i] ?? 0)
          if (games > best.games) best = { raceId: i + 1, games }
        }
        if (best.raceId > 0) favoriteByPlayer.set(pid, best)
      }
    } else {
      for (const r of rows as TeamRow[]) {
        const pid = String(r.playerId)
        const sums = [
          Number(r.a1 ?? 0) + Number(r.b1 ?? 0) + Number(r.c1 ?? 0),
          Number(r.a2 ?? 0) + Number(r.b2 ?? 0) + Number(r.c2 ?? 0),
          Number(r.a3 ?? 0) + Number(r.b3 ?? 0) + Number(r.c3 ?? 0),
          Number(r.a4 ?? 0) + Number(r.b4 ?? 0) + Number(r.c4 ?? 0),
          Number(r.a5 ?? 0) + Number(r.b5 ?? 0) + Number(r.c5 ?? 0),
          Number(r.a6 ?? 0) + Number(r.b6 ?? 0) + Number(r.c6 ?? 0),
          Number(r.a7 ?? 0) + Number(r.b7 ?? 0) + Number(r.c7 ?? 0),
          Number(r.a8 ?? 0) + Number(r.b8 ?? 0) + Number(r.c8 ?? 0),
          Number(r.a9 ?? 0) + Number(r.b9 ?? 0) + Number(r.c9 ?? 0),
        ]
        let best = { raceId: 0, games: -1 }
        for (let i = 0; i < sums.length; i++) {
          const games = sums[i]
          if (games > best.games) best = { raceId: i + 1, games }
        }
        if (best.raceId > 0) favoriteByPlayer.set(pid, best)
      }
    }

    const distinctRaceIds = Array.from(
      new Set(Array.from(favoriteByPlayer.values()).map((v) => v.raceId))
    )
    if (distinctRaceIds.length > 0) {
      const raceRows = await db
        .select({ id: tables.races.id, name: tables.races.name, shortName: tables.races.shortName })
        .from(tables.races)
        .where(inArray(tables.races.id, distinctRaceIds))
      raceInfoMap = new Map(raceRows.map((r) => [r.id, { name: r.name, shortName: r.shortName }]))
    }
  }

  // Precompute per-row totals to return in items
  const totalsByPlayer = new Map<string, { games: number; wins: number; winrate: number }>()
  if (rows.length > 0) {
    const totals = await db
      .select({
        playerId: tables.playersStats.playerId,
        games: totalGamesExpr,
        wins: totalWinsExpr,
      })
      .from(tables.playersStats)
      .where(
        and(
          eq(tables.playersStats.modId, modId),
          eq(tables.playersStats.seasonId, seasonId),
          inArray(
            tables.playersStats.playerId,
            rows.map((r) => Number(r.playerId))
          )
        )
      )

    for (const t of totals) {
      const games = Number(t.games || 0)
      const wins = Number(t.wins || 0)
      const winrate = games > 0 ? Math.round((wins / games) * 10000) / 100 : 0
      totalsByPlayer.set(String(t.playerId), { games, wins, winrate })
    }
  }

  const items = rows.map((r, _idx) => {
    const fav = favoriteByPlayer.get(String(r.playerId))
    const race = fav ? raceInfoMap.get(fav.raceId) : undefined
    const totals = totalsByPlayer.get(String(r.playerId)) || { games: 0, wins: 0, winrate: 0 }
    return {
      rank: r.mmr == null ? null : (rankByMmr.get(Number(r.mmr)) ?? null),
      playerId: r.playerId,
      name: r.name,
      avatarUrl: r.avatarUrl,
      mmr: r.mmr,
      games: totals.games,
      wins: totals.wins,
      winrate: totals.winrate,
      favoriteRaceId: fav?.raceId ?? null,
      favoriteRaceName: race?.name ?? null,
      favoriteRaceShortName: race?.shortName ?? null,
    }
  })

  return {
    items,
    meta: {
      modId,
      seasonId,
      mmrType,
      sort: sortDir,
      page,
      pageSize,
      total,
      totalPages,
    },
  }
})

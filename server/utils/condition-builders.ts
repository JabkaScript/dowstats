import { ne } from 'drizzle-orm'

export function buildWinnerRaceCondition(raceId: number) {
  const g = tables.games
  return or(
    and(eq(g.r1, raceId), or(eq(g.p1, g.w1), eq(g.p1, g.w2), eq(g.p1, g.w3), eq(g.p1, g.w4))),
    and(eq(g.r2, raceId), or(eq(g.p2, g.w1), eq(g.p2, g.w2), eq(g.p2, g.w3), eq(g.p2, g.w4))),
    and(eq(g.r3, raceId), or(eq(g.p3, g.w1), eq(g.p3, g.w2), eq(g.p3, g.w3), eq(g.p3, g.w4))),
    and(eq(g.r4, raceId), or(eq(g.p4, g.w1), eq(g.p4, g.w2), eq(g.p4, g.w3), eq(g.p4, g.w4))),
    and(eq(g.r5, raceId), or(eq(g.p5, g.w1), eq(g.p5, g.w2), eq(g.p5, g.w3), eq(g.p5, g.w4))),
    and(eq(g.r6, raceId), or(eq(g.p6, g.w1), eq(g.p6, g.w2), eq(g.p6, g.w3), eq(g.p6, g.w4))),
    and(eq(g.r7, raceId), or(eq(g.p7, g.w1), eq(g.p7, g.w2), eq(g.p7, g.w3), eq(g.p7, g.w4))),
    and(eq(g.r8, raceId), or(eq(g.p8, g.w1), eq(g.p8, g.w2), eq(g.p8, g.w3), eq(g.p8, g.w4)))
  )
}
export function buildLoserRaceCondition(raceId: number) {
  const g = tables.games
  return or(
    and(eq(g.r1, raceId), and(ne(g.p1, g.w1), ne(g.p1, g.w2), ne(g.p1, g.w3), ne(g.p1, g.w4))),
    and(eq(g.r2, raceId), and(ne(g.p2, g.w1), ne(g.p2, g.w2), ne(g.p2, g.w3), ne(g.p2, g.w4))),
    and(eq(g.r3, raceId), and(ne(g.p3, g.w1), ne(g.p3, g.w2), ne(g.p3, g.w3), ne(g.p3, g.w4))),
    and(eq(g.r4, raceId), and(ne(g.p4, g.w1), ne(g.p4, g.w2), ne(g.p4, g.w3), ne(g.p4, g.w4))),
    and(eq(g.r5, raceId), and(ne(g.p5, g.w1), ne(g.p5, g.w2), ne(g.p5, g.w3), ne(g.p5, g.w4))),
    and(eq(g.r6, raceId), and(ne(g.p6, g.w1), ne(g.p6, g.w2), ne(g.p6, g.w3), ne(g.p6, g.w4))),
    and(eq(g.r7, raceId), and(ne(g.p7, g.w1), ne(g.p7, g.w2), ne(g.p7, g.w3), ne(g.p7, g.w4))),
    and(eq(g.r8, raceId), and(ne(g.p8, g.w1), ne(g.p8, g.w2), ne(g.p8, g.w3), ne(g.p8, g.w4)))
  )
}

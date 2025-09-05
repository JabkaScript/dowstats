import type { SQL } from 'drizzle-orm'

export type WhereCondition = SQL


export interface LadderQuery {
  mod?: string
  season?: string
  mmrType?: 'solo' | 'team'
  search?: string
  sort?: 'asc' | 'desc'
  server?: string
  page?: string
  pageSize?: string
  minGames?: string
}

  export interface BaseLadderRow { 
    playerId: string | number
    name: string
    avatarUrl: string | null
    mmr: number | null
  }
  
  export interface SoloRow extends BaseLadderRow {
    g1: number | null; g2: number | null; g3: number | null; g4: number | null; g5: number | null;
    g6: number | null; g7: number | null; g8: number | null; g9: number | null
  }
  
  export interface TeamRow extends BaseLadderRow {
    a1: number | null; a2: number | null; a3: number | null; a4: number | null; a5: number | null; a6: number | null; a7: number | null; a8: number | null; a9: number | null;
    b1: number | null; b2: number | null; b3: number | null; b4: number | null; b5: number | null; b6: number | null; b7: number | null; b8: number | null; b9: number | null;
    c1: number | null; c2: number | null; c3: number | null; c4: number | null; c5: number | null; c6: number | null; c7: number | null; c8: number | null; c9: number | null;
  }

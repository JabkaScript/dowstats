export type MmrType = 'solo' | 'team'
export type SortDir = 'asc' | 'desc'

export interface LadderItem {
  rank: number
  playerId: number
  name: string
  avatarUrl: string | null
  mmr: number | null
  games: number
  wins: number
  winrate: number
  favoriteRaceId: number | null
  favoriteRaceName: string | null
  favoriteRaceShortName: string | null
}

export interface LadderResponse {
  items: LadderItem[]
  meta: {
    modId: number
    seasonId: number | null
    mmrType: MmrType
    sort: SortDir
    page?: number
    pageSize?: number
    total?: number
    totalPages?: number
  }
}

export interface ModItem {
  id: number
  name: string
  technicalName: string
  position: number
}
export interface ModsResponse {
  items: ModItem[]
}

export interface SeasonItem {
  id: number
  seasonName: string
  isActive: number | boolean
}
export interface SeasonsResponse {
  items: SeasonItem[]
}

export interface ServerItem {
  id: number
  name: string
}
export interface ServersResponse {
  items: ServerItem[]
}

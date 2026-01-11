export interface StatsItem {
  sid: string
  name: string | null
  avatarUrl: string | null
  gamesCount: number
  winsCount: number
  winRate: number
  mmr: number
  mmr1v1: number
  rank: number
  race: number
  apm: number
  isBanned: boolean
  banType?: string | null
  banReason?: string | null
  custom_games_mmr?: number
}

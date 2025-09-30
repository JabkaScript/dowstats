export type MmrType = 'solo' | 'team'
export type SortDir = 'asc' | 'desc'

export interface RelicApiResult {
  code: number
  message: string
}

export interface PlayerProfile {
  profile_id: number
  name: string
  alias: string
  personal_statgroup_id: number
  xp: number
  level: number
  leaderboardregion_id: number
  country: string
}

export interface StatGroupMember {
  profile_id: number
  name: string
  alias: string
  personal_statgroup_id: number
  xp: number
  level: number
  leaderboardregion_id: number
  country: string
}

export interface StatGroup {
  id: number
  name: string
  type: number
  members: StatGroupMember[]
}

export interface LeaderboardStat {
  statgroup_id: number
  leaderboard_id: number
  wins: number
  losses: number
  streak: number
  disputes: number
  drops: number
  rank: number
  ranktotal: number
  ranklevel: number
  rating: number
  regionrank: number
  regionranktotal: number
  lastmatchdate: number
  highestrank: number
  highestranklevel: number
  highestrating: number
}

export interface PlayerStatsResponse {
  result: RelicApiResult
  statGroups: StatGroup[]
  leaderboardStats: LeaderboardStat[]
}

export interface PlayerStatsWithRankResponse {
  result: RelicApiResult
  statGroups: StatGroup[]
  leaderboardStats: LeaderboardStat[]
  rankTotal: number
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

export interface LeaderboardMap {
  matchtype_id: number
  statgroup_type: number
  race_id: number
}

export interface Leaderboard {
  id: number
  name: string
  isranked: number
  leaderboardmap: LeaderboardMap[]
}

export interface LeaderboardsResponse {
  result: RelicApiResult
  leaderboards: Leaderboard[]
}

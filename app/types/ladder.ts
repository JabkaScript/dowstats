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

export interface RelicApiResult {
  code: number
  message: string
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

export interface RelicApiResponse {
  result: RelicApiResult
  statGroups: StatGroup[]
  leaderboardStats: LeaderboardStat[]
}

export interface MatchHistoryMember {
  profile_id: number
  race_id: number
  teamid: number
  wins: number
  losses: number
  outcome: number
}

export interface SlotInfo {
  team1: number[]
  team2: number[]
}

export interface MatchHistoryStat {
  id: number
  creator_profile_id: number
  mapname: string
  matchtype_id: number
  startgametime: number
  completiontime: number
  slotinfo: SlotInfo
  matchhistorymember: MatchHistoryMember[]
}

export interface RecentMatchesResponse {
  result: RelicApiResult
  matchHistoryStats: MatchHistoryStat[]
  profiles: StatGroupMember[]
}

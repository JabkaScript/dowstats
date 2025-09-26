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
  // present in live API, used in UI
  highestrating: number
}

export interface RelicApiResult {
  code: number
  message: string
}

export interface MatchHistoryReportResult {
  matchhistory_id: number
  profile_id: number
  resulttype: number
  teamid: number
  race_id: number
  xpgained: number
  counters: string
  matchstartdate: number
}

export interface MatchHistoryMember {
  matchhistory_id: number
  profile_id: number
  race_id: number
  statgroup_id: number
  teamid: number
  wins: number
  losses: number
  streak: number
  arbitration: number
  outcome: number
  oldrating: number
  newrating: number
  reporttype: number
}

export interface MatchHistoryItem {
  id: number
  creator_profile_id: number
  mapname: string
  maxplayers: number
  matchtype_id: number
  options: string
  slotinfo: string
  description: string
  startgametime: number
  completiontime: number
  observertotal: number
  matchhistoryreportresults: MatchHistoryReportResult[]
  matchhistoryitems: unknown[] // Пустой массив в примере, тип может быть уточнен позже
  matchurls: unknown[] // Пустой массив в примере, тип может быть уточнен позже
  matchhistorymember: MatchHistoryMember[]
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

export interface MatchHistoryResponse {
  result: RelicApiResult
  matchHistoryStats: MatchHistoryItem[]
  profiles: PlayerProfile[]
}

// Player Statistics Interfaces
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

// DowStats API Response Interfaces
export interface DowStatsPlayerItem {
  playerId: number
  sid: number | null
  name: string | null
  avatarUrl: string
  serverId: number
  mmr: number | null
  overallMmr: number | null
  maxMmr: number | null
  maxOverallMmr: number | null
  totalGamesSolo: number
  totalWinsSolo: number
  totalGamesTeam: number
  totalWinsTeam: number
}

export interface DowStatsResponse {
  item: DowStatsPlayerItem | null
  meta: {
    playerId: number
    modId: number
    seasonId: number
  }
}

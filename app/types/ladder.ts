import type { MmrType, SortDir, RelicApiResult, PlayerProfile } from '~~/shared/types/relic-api'

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

export interface MatchHistoryResponse {
  result: RelicApiResult
  matchHistoryStats: MatchHistoryItem[]
  profiles: PlayerProfile[]
}

// DowStats API Response Interfaces
export interface DowStatsPlayerItem {
  playerId: number
  sid: number | null
  name: string | null
  avatarUrl: string
  serverId: number
  stats: {
    id: number
    playerId: number
    seasonId: number
    modId: number
    modVersion: string | null
    '1X11': number
    '1X11W': number
    '1X12': number
    '1X12W': number
    '1X13': number
    '1X13W': number
    '1X14': number
    '1X14W': number
    '1X15': number
    '1X15W': number
    '1X16': number
    '1X16W': number
    '1X17': number
    '1X17W': number
    '1X18': number
    '1X18W': number
    '1X19': number
    '1X19W': number
    '2X21': number
    '2X21W': number
    '2X22': number
    '2X22W': number
    '2X23': number | null
    '2X23W': number
    '2X24': number | null
    '2X24W': number
    '2X25': number
    '2X25W': number
    '2X26': number
    '2X26W': number
    '2X27': number
    '2X27W': number
    '2X28': number
    '2X28W': number
    '2X29': number
    '2X29W': number
    '3X31': number
    '3X31W': number
    '3X32': number
    '3X32W': number
    '3X33': number
    '3X33W': number
    '3X34': number
    '3X34W': number
    '3X35': number
    '3X35W': number
    '3X36': number
    '3X36W': number
    '3X37': number
    '3X37W': number
    '3X38': number
    '3X38W': number
    '3X39': number
    '3X39W': number
    '4X41': number
    '4X41W': number
    '4X42': number
    '4X42W': number
    '4X43': number
    '4X43W': number
    '4X44': number
    '4X44W': number
    '4X45': number
    '4X45W': number
    '4X46': number
    '4X46W': number
    '4X47': number
    '4X47W': number
    '4X48': number
    '4X48W': number
    '4X49': number
    '4X49W': number
    mmr: number
    overallMmr: number
    maxMmr: number
    maxOverallMmr: number
    customGamesMmr: number
  }
}

export interface DowStatsResponse {
  item: DowStatsPlayerItem | null
  meta: {
    playerId: number
    modId: number
    seasonId: number
  }
}

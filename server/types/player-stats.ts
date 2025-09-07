/**
 * Interfaces for player statistics
 */

/**
 * Race statistics
 */
export interface RaceStats {
  raceId: number
  raceName: string | null
  raceShortName: string | null
  games: number
  wins: number
  losses: number
}

/**
 * Aggregated statistics by format
 */
export interface FormatTotal {
  totalGames: number
  totalWins: number
  totalLosses: number
  winrate: number | null
}

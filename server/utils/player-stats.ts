import type { RaceStats, FormatTotal } from '~~/server/types/player-stats'

/**
 * Function to calculate win rate percentage
 * @param wins Number of wins
 * @param games Total number of games
 * @returns Win rate percentage (with 0.1% precision) or null
 */
export const calculateWinrate = (wins: number | null, games: number | null): number | null =>
  games && games > 0 && wins != null ? Math.round((wins / games) * 1000) / 10 : null

/**
 * Function to calculate format aggregates
 * @param raceStats Array of race statistics
 * @returns Aggregated statistics by format
 */
export const calculateFormatTotal = (raceStats: RaceStats[]): FormatTotal => {
  const totalGames = raceStats.reduce((sum, race) => sum + race.games, 0)
  const totalWins = raceStats.reduce((sum, race) => sum + race.wins, 0)
  const totalLosses = raceStats.reduce((sum, race) => sum + race.losses, 0)

  return {
    totalGames,
    totalWins,
    totalLosses,
    winrate: calculateWinrate(totalWins, totalGames),
  }
}

/**
 * Function to combine statistics from multiple formats
 * @param formatTotals Array of aggregated statistics by formats
 * @returns Overall aggregated statistics
 */
export const combineFormatTotals = (formatTotals: FormatTotal[]): FormatTotal => {
  const totalGames = formatTotals.reduce((sum, format) => sum + format.totalGames, 0)
  const totalWins = formatTotals.reduce((sum, format) => sum + format.totalWins, 0)
  const totalLosses = formatTotals.reduce((sum, format) => sum + format.totalLosses, 0)

  return {
    totalGames,
    totalWins,
    totalLosses,
    winrate: calculateWinrate(totalWins, totalGames),
  }
}

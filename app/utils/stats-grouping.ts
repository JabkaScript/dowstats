import type { LeaderboardStat } from '~/types/ladder'

export function groupLeaderboardStatsByMatchType(stats: LeaderboardStat[]) {
  const boards = useRelicLeaderboards()
  const matchTypes = useMatchTypes()
  const grouped: Record<string, LeaderboardStat[]> = {}
  Object.values(matchTypes).forEach((type) => {
    grouped[type] = []
  })

  stats?.forEach((stat) => {
    const board = boards.find((b) => b.id === stat.leaderboard_id)
    if (board?.leaderboardmap?.[0]) {
      const matchTypeId = board.leaderboardmap[0].matchtype_id
      switch (matchTypeId) {
        case 0:
          grouped['Custom']?.push(stat)
          break
        case 1:
          grouped[matchTypes[1]]?.push(stat)
          break
        case 2:
          grouped[matchTypes[2]]?.push(stat)
          break
        case 3:
          grouped[matchTypes[3]]?.push(stat)
          break
        case 4:
          grouped[matchTypes[4]]?.push(stat)
          break
      }
    }
  })

  return grouped
}

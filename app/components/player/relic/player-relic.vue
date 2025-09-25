<script setup lang="ts">
import type { MatchHistoryResponse, PlayerStatsResponse } from '~/types/ladder'
import { groupLeaderboardStatsByMatchType } from '~/utils/stats-grouping'
import PlayerStatsTabs from './player-relic-stats-tabs.vue'
import PlayerStatsTable from './player-relic-stats-table.vue'
import PlayerRecentMatchesTable from './player-relic-matches.vue'

interface Props {
  pid: string
  relicData?: PlayerStatsResponse
}

const { pid, relicData = {} as PlayerStatsResponse } = defineProps<Props>()
const { data: recentMatches } = await useFetch<MatchHistoryResponse>(
  `/api/proxy/relic/community/leaderboard/getrecentmatchhistorybyprofileid`,
  {
    server: true,
    query: { sortBy: 1, profile_id: pid, title: 'dow1-de', count: 100 },
  }
)

const matchesSort = computed(() => {
  return recentMatches.value?.matchHistoryStats.toSorted((a, b) => b.id - a.id)
})
const leaderboardStats = computed(() => {
  if (!relicData?.leaderboardStats) {
    return {}
  }
  return groupLeaderboardStatsByMatchType(relicData?.leaderboardStats)
})
</script>
<template>
  <PlayerStatsTabs v-slot="{ item }">
    <PlayerStatsTable v-if="item.value !== 'recent'" :data="leaderboardStats[item.value]" />
    <PlayerRecentMatchesTable
      v-else
      :matches="matchesSort"
      :pid
      :profiles="recentMatches?.profiles"
    />
  </PlayerStatsTabs>
</template>

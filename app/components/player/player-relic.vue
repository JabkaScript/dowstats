<script setup lang="ts">
import type { RecentMatchesResponse, PersonalStatsResponse } from '~/types/ladder'
import PlayerProfileCard from './player-profile-card.vue'
import { groupLeaderboardStatsByMatchType } from '~/utils/stats-grouping'
import PlayerStatsTabs from './player-stats-tabs.vue'
import PlayerStatsTable from './player-stats-table.vue'
import PlayerRecentMatchesTable from './player-recent-matches-table.vue'

interface Props {
  sid: string
}

const { sid } = defineProps<Props>()
const profileNames = computed(() => {
  return JSON.stringify([`/steam/${sid}`])
})
const { data: relicData } = await useFetch<PersonalStatsResponse>(
  `/api/proxy/relic/community/leaderboard/getpersonalstat?title=dow1-de&profile_names=${profileNames.value}`,
  { server: true, cache: 'default' }
)
const { data: avatar } = await useFetch(`/api/v1/players/${sid}/avatar`, { server: true })
const alias = computed(() => relicData?.value?.statGroups[0]?.members[0]?.alias)
const profileId = computed(() => relicData?.value?.statGroups[0]?.members[0]?.profile_id)
const title = computed(() => `${alias.value} | DoW Stats`)
const { data: recentMatches } = await useFetch<RecentMatchesResponse>(
  `/api/proxy/relic/community/leaderboard/getrecentmatchhistorybyprofileid`,
  {
    server: false,
    query: { sortBy: 1, profile_id: profileId.value, title: 'dow1-de', count: 100 },
  }
)

const leaderboardStats = computed(() => {
  if (!relicData?.value?.leaderboardStats) {
    return {}
  }
  return groupLeaderboardStatsByMatchType(relicData?.value?.leaderboardStats)
})

useHead({
  title,
})
</script>
<template>
  <PlayerProfileCard :avatar :alias :sid :pid="profileId?.toString() || ''" />
  <PlayerStatsTabs v-slot="{ item }">
    <PlayerStatsTable v-if="item.value !== 'recent'" :data="leaderboardStats[item.value]" />
    <PlayerRecentMatchesTable
      v-else
      :matches="recentMatches?.matchHistoryStats"
      :profile-id="profileId || 0"
      :profiles="recentMatches?.profiles"
    />
  </PlayerStatsTabs>
</template>

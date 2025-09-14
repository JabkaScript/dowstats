<script setup lang="ts">
import type { RelicApiResponse } from '~/types/ladder'
import PlayerProfileCard from './player-profile-card.vue'
import { groupLeaderboardStatsByMatchType } from '~/utils/stats-grouping'
import PlayerStatsTabs from './player-stats-tabs.vue'
import PlayerStatsTable from './player-stats-table.vue'

interface Props {
  sid: string
}

const { sid } = defineProps<Props>()
const profileNames = computed(() => {
  return JSON.stringify([`/steam/${sid}`])
})
const { data: relicData } = useFetch<RelicApiResponse>(
  `/api/proxy/relic/community/leaderboard/getpersonalstat?title=dow1-de&profile_names=${profileNames.value}`,
  { server: true, cache: 'default' }
)
const { data: avatar } = useFetch(`/api/v1/players/${sid}/avatar`, { server: true })
const alias = computed(() => relicData?.value?.statGroups[0]?.members[0]?.alias)
const profileId = computed(() => relicData?.value?.statGroups[0]?.members[0]?.profile_id)
const title = computed(() => `${alias.value} | DoW Stats`)
// const { data: recentMatches } = useFetch<RecentMatchesResponse>(
//   `/api/proxy/relic/community/leaderboard/getrecentmatchhistorybyprofileid?title=dow1-de&profile_id=${profileId.value}`,
//   { server: true }
// )

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
  </PlayerStatsTabs>
</template>

<script setup lang="ts">
import type { LeaderboardsResponse } from '~~/shared/types/relic-api'

interface Leaderboard {
  id: number
  name: string
  isranked: number
}

useHead({
  title: 'Relic Ladder | DoW Stats',
})
definePageMeta({
  title: 'Relic Ladder',
  name: 'relic-ladder',
})

const { data } = await useFetch<LeaderboardsResponse>(
  '/api/proxy/relic/community/leaderboard/getavailableleaderboards?title=dow1-de',
  { server: true }
)
const { relicMatchType, relicRace } = storeToRefs(useFiltersStore())

const extractRelicRace = (name: string) => name.match(/_([a-z_]+)_race(?:_|$)/)?.[1] ?? ''
const leaderboards = computed<Leaderboard[]>(() => {
  return (
    data.value?.leaderboards?.filter(
      (i) =>
        i.isranked === 1 &&
        (relicMatchType.value === 'all' || i.name.includes(relicMatchType.value)) &&
        (relicRace.value === 'all' || extractRelicRace(i.name) === relicRace.value)
    ) || []
  )
})
</script>
<template>
  <UPage>
    <UContainer>
      <UPageHeader class="py-2">
        <div class="flex gap-2 items-center">
          <UFormField :label="$t('ladder.matchType')">
            <MatchTypeSelector v-model="relicMatchType" class="w-32" hide-all />
          </UFormField>
          <UFormField class="w-full md:w-64" :label="$t('ladder.race')">
            <RaceSelector v-model="relicRace" class="w-full" type="relic_name" />
          </UFormField>
        </div>
      </UPageHeader>
      <div
        class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 justify-center py-2"
        :class="{ '!grid-cols-1': relicRace !== 'all' }"
      >
        <RelicLadderTable
          v-for="leaderboard in leaderboards"
          :key="leaderboard.id"
          :leaderboard-id="leaderboard.id.toString()"
          :name="leaderboard.name"
          :is-single="relicRace !== 'all'"
        />
      </div>
    </UContainer>
  </UPage>
</template>

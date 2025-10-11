<script setup lang="ts">
import type { DowStatsResponse } from '~/types/ladder'

definePageMeta({
  name: 'player',
})
const route = useRoute()
const sid = route.params.id as string
const { statsType } = storeToRefs(useFiltersStore())
const items = computed(() => {
  return [
    {
      label: 'Relic',
      value: 'relic',
    },
    {
      label: 'Dow Stats',
      value: 'dowstats',
      disabled: true
    },
  ]
})

const profileNames = computed(() => {
  return JSON.stringify([`/steam/${sid}`])
})

const { data: dowstatsData, refresh: refreshDowStatsData } = await useFetch<DowStatsResponse>(
  `/api/v1/players/${sid}`,
  {
    server: true,
  }
)
const { data: relicData, refresh: refreshRelicData } = await useFetch<PlayerStatsResponse>(
  `/api/proxy/relic/community/leaderboard/getpersonalstat?title=dow1-de&profile_names=${profileNames.value}`,
  { server: true, cache: 'default' }
)

const alias = computed(() => relicData?.value?.statGroups[0]?.members[0]?.alias)
const pid = computed(
  () => relicData?.value?.statGroups[0]?.members[0]?.profile_id?.toString() || ''
)

function refreshData() {
  refreshDowStatsData()
  refreshRelicData()
}

useHead({
  title: `${alias.value} | Dow Stats`,
})
</script>
<template>
  <UContainer>
    <UPage class="py-2">
      <div class="flex justify-between mb-2">
        <UTabs v-model="statsType" variant="link" class="w-fit" :content="false" :items />
        <UButton size="sm" variant="soft" icon="lucide:refresh-cw" @click.stop="refreshData">
          {{ $t('player.refresh') }}
        </UButton>
      </div>
      <PlayerProfileCard :avatar="dowstatsData?.item?.avatarUrl || ''" :alias :sid :pid />
      <KeepAlive>
        <PlayerRelic v-if="statsType === 'relic'" :pid :relic-data />
      </KeepAlive>
      <DevOnly>
        <PlayerDowstats v-if="statsType === 'dowstats'" :pid :dowstats-data />
      </DevOnly>
    </UPage>
  </UContainer>
</template>

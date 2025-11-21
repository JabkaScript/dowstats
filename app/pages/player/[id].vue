<script setup lang="ts">
import type { DowStatsResponse } from '~/types/ladder'
import type { PlayerStatsResponse } from '~~/shared/types/relic-api'

definePageMeta({
  name: 'player',
})
const route = useRoute()
const routeId = route.params.id as string
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
    },
  ]
})

const { data: dowstatsData, refresh: refreshDowStatsData } = await useFetch<DowStatsResponse>(
  `/api/v1/players/${routeId}`,
  {
    server: true,
  }
)

const steamSid = computed(() => dowstatsData.value?.item?.sid?.toString() || '')
const profileNames = computed(() =>
  steamSid.value ? JSON.stringify([`/steam/${steamSid.value}`]) : ''
)

const relicData = ref<PlayerStatsResponse | null>(null)
const relicPending = ref(false)
const relicError = ref<string | null>(null)

watch(
  profileNames,
  async (names) => {
    relicError.value = null
    relicData.value = null
    if (!names) return
    try {
      relicPending.value = true
      const res = await $fetch<PlayerStatsResponse>(
        '/api/proxy/relic/community/leaderboard/getpersonalstat',
        { cache: 'default', query: { title: 'dow1-de', profile_names: names } }
      )
      relicData.value = res
    } catch (e) {
      relicError.value = String((e as any)?.data || (e as any)?.message || e)
    } finally {
      relicPending.value = false
    }
  },
  { immediate: true }
)

const alias = computed(() => relicData.value?.statGroups?.[0]?.members?.[0]?.alias)
const pid = computed(
  () => relicData.value?.statGroups?.[0]?.members?.[0]?.profile_id?.toString() || ''
)

async function refreshData() {
  await refreshDowStatsData()
}

useHead({
  title: `${alias.value || dowstatsData.value?.item?.name || 'Player'} | Dow Stats`,
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
      <PlayerProfileCard
        :avatar="dowstatsData?.item?.avatarUrl || ''"
        :alias
        :sid="steamSid"
        :pid
      />
      <KeepAlive>
        <PlayerRelic v-if="statsType === 'relic'" :pid :relic-data />
      </KeepAlive>
      <PlayerDowstats v-if="statsType === 'dowstats'" :pid :dowstats-data />
    </UPage>
  </UContainer>
</template>

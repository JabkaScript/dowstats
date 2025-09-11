<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { leaderboardId, name, isSingle } = defineProps<{
  leaderboardId: string
  name: string
  isSingle: boolean
}>()
const { t, locale } = useI18n()
const columns = computed<TableColumn<{ name: string; rating: number }>[]>(() => {
  void locale.value
  const base = [
    {
      id: 'rank',
      accessorKey: 'rank',
      header: t('ladder.rank'),
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: t('ladder.name'),
    },
    {
      id: 'rating',
      accessorKey: 'rating',
      header: t('ladder.rating'),
    },
  ]

  if (!isSingle) {
    base.unshift({
      id: 'expand',
      accessorKey: 'expand',
      header: '',
    })
  } else {
    base.splice(3, 0, {
      id: 'highestRating',
      accessorKey: 'highestRating',
      header: t('ladder.highestRating'),
    })
    base.splice(4, 0, {
      id: 'currentStreak',
      accessorKey: 'currentStreak',
      header: t('ladder.currentStreak'),
    })
    base.push(
      { id: 'wins', accessorKey: 'wins', header: t('ladder.wins') },
      { id: 'losses', accessorKey: 'losses', header: t('ladder.losses') },
      { id: 'winrate', accessorKey: 'winrate', header: t('ladder.winrate') }
    )
  }
  return base
})

const expanded = ref({})
const raceName = computed(() => name.replace(/\d+v\d+_/g, ''))
const { data, pending } = useFetch(
  `/api/proxy/relic/community/leaderboard/getleaderboard2?title=dow1-de&leaderboard_id=${leaderboardId}&sortBy=1&start=1&count=50`,
  { cache: 'default' }
)
const leaderboardStats = computed(() => data.value?.leaderboardStats)
const statGroups = computed(() => data.value?.statGroups)

function getNickname(statGroupId: unknown) {
  const statGroup = statGroups.value?.find(
    (i: { id: string; members: { alias: string }[] }) => i.id === statGroupId
  )

  return statGroup?.members[0].alias
}
</script>
<template>
  <div class="flex flex-col gap-2 border border-neutral-200 p-2 rounded shadow">
    <RelicLadderTableHeader :name="raceName" :is-single />

    <div v-if="pending" class="space-y-2">
      <div class="space-y-1">
        <USkeleton v-for="n in 8" :key="n" class="h-6 w-full" />
      </div>
    </div>

    <ClientOnly v-else>
      <UTable
        v-model:expanded="expanded"
        :data="leaderboardStats"
        :columns
        :ui="{ td: 'p-1', th: 'p-1', tr: 'even:bg-neutral-100 even:dark:bg-neutral-800' }"
      >
        <template #expand-cell="{ row }">
          <UButton
            color="neutral"
            icon="lucide:chevron-down"
            variant="ghost"
            size="xs"
            square
            :ui="{
              leadingIcon: [
                'transition-transform',
                row.getIsExpanded() ? 'duration-200 rotate-180' : '',
              ],
            }"
            @click="row.toggleExpanded()"
          />
        </template>
        <template #rating-header>
          <div class="text-right">{{ t('ladder.rating') }}</div>
        </template>
        <template #wins-header>
          <div class="text-right">{{ t('ladder.wins') }}</div>
        </template>
        <template #losses-header>
          <div class="text-right">{{ t('ladder.losses') }}</div>
        </template>
        <template #winrate-header>
          <div class="text-right">{{ t('ladder.winrate') }}</div>
        </template>
        <template #currentStreak-header>
          <div class="text-right">{{ t('ladder.currentStreak') }}</div>
        </template>
        <template #highestRating-header>
          <div class="text-right">{{ t('ladder.highestRating') }}</div>
        </template>
        <template #name-cell="{ row }">
          {{ getNickname(row.original.statgroup_id) }}
        </template>
        <template #rating-cell="{ row }">
          <div class="tabular-nums text-right w-full">{{ row.original.rating }}</div>
        </template>
        <template #wins-cell="{ row }">
          <div class="tabular-nums text-right w-full">{{ row.original.wins }}</div>
        </template>
        <template #losses-cell="{ row }">
          <div class="tabular-nums text-right w-full">{{ row.original.losses }}</div>
        </template>
        <template #winrate-cell="{ row }">
          <div class="tabular-nums text-right w-full">
            {{
              ((row.original.wins / (row.original.wins + row.original.losses)) * 100).toFixed(2)
            }}%
          </div>
        </template>
        <template #currentStreak-cell="{ row }">
          <div class="tabular-nums text-right w-full">{{ row.original.streak }}</div>
        </template>
        <template #highestRating-cell="{ row }">
          <div class="tabular-nums text-right w-full">{{ row.original.highestrating }}</div>
        </template>
        <template #expanded="{ row }">
          <ul class="flex flex-col gap-0.5 p-1">
            <li>{{ $t('ladder.wins') }}: {{ row.original.wins }}</li>
            <li>{{ $t('ladder.losses') }}: {{ row.original.losses }}</li>
            <li>{{ $t('ladder.highestRating') }}: {{ row.original.highestrating }}</li>
            <li>{{ $t('ladder.currentStreak') }}: {{ row.original.streak }}</li>
          </ul>
        </template>
      </UTable>
    </ClientOnly>
  </div>
</template>

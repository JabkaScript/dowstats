<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { leaderboardId, name } = defineProps<{ leaderboardId: string; name: string }>()
const { t } = useI18n()
const columns: TableColumn<{ name: string; rating: number }>[] = [
  {
    id: 'expand',
    accessorKey: 'expand',
    header: '',
  },
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

const expanded = ref({})
const raceName = computed(() => name.replace('1v1_', ''))
const { data } = await useFetch(
  `/api/proxy/relic/community/leaderboard/getleaderboard2?title=dow1-de&leaderboard_id=${leaderboardId}&sortBy=1&start=1&count=50`,
  { server: true }
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
    <RelicLadderTableHeader :name="raceName" />
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
      <template #name-cell="{ row }">
        {{ getNickname(row.original.statgroup_id) }}
      </template>
      <template #rating-cell="{ row }">
        <div class="tabular-nums text-right w-full">{{ row.original.rating }}</div>
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
  </div>
</template>

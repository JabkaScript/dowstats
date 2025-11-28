<script setup lang="ts">
import type { SortingState } from '@tanstack/vue-table'
const boards = useRelicLeaderboards()
const { t } = useI18n()
const columns = computed(() => {
  return [
    {
      id: 'board',
      accessorKey: 'board',
      header: t('ladder.board'),
      enablePinning: true,
    },
    {
      id: 'rank',
      accessorKey: 'rank',
      header: t('ladder.rank'),
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      id: 'rating',
      accessorKey: 'rating',
      header: t('ladder.rating'),
      enableSorting: true,
    },
    {
      id: 'wins',
      accessorKey: 'wins',
      header: t('ladder.wins'),
      enableSorting: true,
    },
    {
      id: 'losses',
      accessorKey: 'losses',
      header: t('ladder.losses'),
      enableSorting: true,
    },
    {
      id: 'winrate',
      accessorKey: 'winrate',
      header: t('ladder.winrate'),
      enableSorting: true,
    },
    {
      id: 'games',
      accessorKey: 'games',
      header: t('ladder.games'),
      enableSorting: true,
    },
    {
      id: 'currentStreak',
      accessorKey: 'streak',
      header: t('ladder.currentStreak'),
      enableSorting: true,
    },
    {
      id: 'highest-rating',
      accessorKey: 'highestrating',
      header: t('ladder.highestRating'),
      enableSorting: true,
    },
  ]
})

function getBoardName(id: number) {
  return t(formatBoardName(removeMatchType(boards.find((board) => board.id === id)?.name || '')))
}

function wrClass(wr: number) {
  if (wr >= 60) return 'text-emerald-600 dark:text-emerald-300'
  if (wr >= 50) return 'text-amber-600 dark:text-amber-300'
  return 'text-rose-600 dark:text-rose-300'
}

const sorting = ref<SortingState>([])
</script>
<template>
  <UTable
    v-model:sorting="sorting"
    :sorting-options="{ enableSorting: true }"
    :columns
    :ui="{
      base: 'table-fixed w-full min-w-0 overflow-hidden',
      th: 'p-2 font-semibold text-neutral-700 dark:text-zinc-200',
      td: 'p-2',
      tr: 'even:bg-neutral-100 even:dark:bg-neutral-800 hover:bg-amber-50/60 hover:dark:bg-neutral-700/40',
    }"
  >
    <template #board-cell="{ row }">
      <span class="font-medium">
        {{ getBoardName(row.original.leaderboard_id as unknown as number) }}
      </span>
    </template>
    <template #rank-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.rank')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #rank-cell="{ row }">
      <div class="text-right tabular-nums">{{ row.original.rank }}</div>
    </template>
    <template #rating-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.rating')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #wins-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.wins')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #losses-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.losses')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #winrate-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.winrate')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #games-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.games')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #currentStreak-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.currentStreak')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #highest-rating-header="{ column }">
      <div class="flex justify-end">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('ladder.highestRating')"
          :icon="
            column.getIsSorted()
              ? column.getIsSorted() === 'asc'
                ? 'i-lucide-arrow-up-narrow-wide'
                : 'i-lucide-arrow-down-wide-narrow'
              : 'i-lucide-arrow-up-down'
          "
          class="-mx-2.5"
          @click="column.toggleSorting(column.getIsSorted() === 'asc')"
        />
      </div>
    </template>
    <template #rating-cell="{ row }">
      <div class="tabular-nums text-right w-full font-medium">{{ row.original.rating }}</div>
    </template>
    <template #wins-cell="{ row }">
      <div class="tabular-nums text-right w-full">{{ row.original.wins }}</div>
    </template>
    <template #losses-cell="{ row }">
      <div class="tabular-nums text-right w-full">{{ row.original.losses }}</div>
    </template>
    <template #winrate-cell="{ row }">
      <div
        class="tabular-nums text-right w-full font-semibold"
        :class="
          wrClass(
            Number(
              ((row.original.wins / (row.original.wins + row.original.losses)) * 100 || 0).toFixed(
                2
              )
            )
          )
        "
      >
        {{ ((row.original.wins / (row.original.wins + row.original.losses)) * 100).toFixed(2) }}%
      </div>
    </template>
    <template #games-cell="{ row }">
      <div class="tabular-nums text-right w-full">
        {{ row.original.wins + row.original.losses }}
      </div>
    </template>
    <template #currentStreak-cell="{ row }">
      <div class="tabular-nums text-right w-full">{{ row.original.streak }}</div>
    </template>
    <template #highest-rating-cell="{ row }">
      <div class="tabular-nums text-right w-full">{{ row.original.highestrating }}</div>
    </template>
    <template #games-footer>a</template>
  </UTable>
</template>

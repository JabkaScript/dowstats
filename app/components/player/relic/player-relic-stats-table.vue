<script setup lang="ts">
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
</script>
<template>
  <UTable :columns>
    <template #board-cell="{ row }">
      {{ getBoardName(row.original.leaderboard_id) }}
    </template>
    <template #rank-header>
      <div class="text-right">{{ t('ladder.rank') }}</div>
    </template>
    <template #rank-cell="{ row }">
      <div class="text-right tabular-nums">{{ row.original.rank }}</div>
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
    <template #games-header>
      <div class="text-right">{{ t('ladder.games') }}</div>
    </template>
    <template #currentStreak-header>
      <div class="text-right">{{ t('ladder.currentStreak') }}</div>
    </template>
    <template #highest-rating-header>
      <div class="text-right">{{ t('ladder.highestRating') }}</div>
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

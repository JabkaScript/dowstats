<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { LadderItem } from '~/types/ladder'

defineProps<{ mmrType?: 'solo' | 'team' }>()
const localePath = useLocalePath()

const columns: TableColumn<LadderItem>[] = [
  {
    id: 'rank',
    accessorKey: 'rank',
  },
  {
    id: 'name',
    accessorKey: 'name',
  },
  {
    id: 'favoriteRaceName',
    accessorKey: 'favoriteRaceName',
  },
  {
    id: 'mmr',
    accessorKey: 'mmr',
  },
  {
    id: 'games',
    accessorKey: 'games',
  },
  {
    id: 'wins',
    accessorKey: 'wins',
  },
  {
    id: 'winrate',
    accessorKey: 'winrate',
  },
]

const formatInt = (v: unknown): string => {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  return Number.isFinite(n) ? n.toString() : String(v ?? '')
}

const formatPct = (v: unknown): string => {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  return (Number.isFinite(n) ? n : 0).toFixed(2)
}
</script>
<template>
  <UTable :columns>
    <template #empty>
      <div
        class="flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400"
      >
        <UIcon name="i-lucide-users" class="mb-2 h-6 w-6" />

        <p class="font-medium">{{ $t('ladder.nothingToShow') }}</p>
        <p class="text-sm">{{ $t('ladder.adjustFilters') }}</p>
      </div>
    </template>
    <template #rank-header>
      <div class="text-left">#</div>
    </template>
    <template #rank-cell="{ row }">
      <span class="block w-full text-left text-highlighted">{{ row.getValue('rank') }}</span>
    </template>
    <template #name-header>
      {{ $t('Player') }}
    </template>
    <template #name-cell="{ row }">
      <NuxtLink
        :to="localePath({ name: 'player', params: { id: String(row.original.playerId) } })"
        class="flex items-center gap-3 hover:underline"
        :aria-label="`Open profile: ${row.getValue('name')}`"
      >
        <UAvatar
          class="hidden md:flex"
          :src="row.original.avatarUrl"
          alt="Avatar"
          size="sm"
          icon="i-lucide-user"
        />
        <span class="truncate text-highlighted max-w-[200px] sm:max-w-none">
          {{ row.getValue('name') }}
        </span>
      </NuxtLink>
    </template>
    <template #mmr-header>
      <div class="text-right">
        {{ mmrType === 'solo' ? $t('Solo') : $t('Team') }} {{ $t('MMR') }}
      </div>
    </template>
    <template #mmr-cell="{ row }">
      <span class="block text-right tabular-nums font-medium text-highlighted">
        {{ formatInt(row.getValue('mmr')) }}
      </span>
    </template>

    <template #games-header>
      <div class="text-right">{{ $t('ladder.games') }}</div>
    </template>
    <template #games-cell="{ row }">
      <span class="block text-right tabular-nums">{{ formatInt(row.getValue('games')) }}</span>
    </template>
    <template #wins-header>
      <div class="text-right">{{ $t('ladder.wins') }}</div>
    </template>
    <template #wins-cell="{ row }">
      <span class="block text-right tabular-nums">{{ formatInt(row.getValue('wins')) }}</span>
    </template>
    <template #winrate-header>
      <div class="text-right">{{ $t('ladder.winrate') }}</div>
    </template>
    <template #winrate-cell="{ row }">
      <span class="block text-right tabular-nums">{{ formatPct(row.getValue('winrate')) }}%</span>
    </template>
    <template #favoriteRaceName-header>
      {{ $t('Favorite Race') }}
    </template>
    <template #favoriteRaceName-cell="{ row }">
      {{ row.original.favoriteRaceName || row.getValue('favoriteRaceName') || '—' }}
    </template>
  </UTable>
</template>

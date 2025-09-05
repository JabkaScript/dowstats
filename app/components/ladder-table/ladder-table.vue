<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { LadderItem } from '~/types/ladder'

const props = defineProps<{ data: LadderItem[]; loading?: boolean; sticky?: boolean }>()

const columns: TableColumn<LadderItem>[] = [
    {
        id: 'rank',
        accessorKey: 'rank'
    },
    {
        id: 'name',
        accessorKey: 'name'
    },
    {
        id: 'mmr',
        accessorKey: 'mmr'
    },
    {
        id: 'games',
        accessorKey: 'games'
    },
    {
        id: 'wins',
        accessorKey: 'wins'
    },
    {
        id: 'winrate',
        accessorKey: 'winrate'
    },
    {
        id: 'favoriteRaceName',
        accessorKey: 'favoriteRaceName'
    }
]

const formatInt = (v: unknown): string => {
    const n = typeof v === 'number' ? v : Number((v) ?? 0)
    return Number.isFinite(n) ? n.toString() : String((v) ?? '')
}

const formatPct = (v: unknown): string => {
    const n = typeof v === 'number' ? v : Number((v) ?? 0)
    return (Number.isFinite(n) ? n : 0).toFixed(2)
}
</script>
<template>
    <UTable :data="props.data" :columns="columns" :loading="props.loading" :sticky="props.sticky">
        <template #empty>
            <div class="flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400">
                <UIcon name="i-lucide-users" class="mb-2 h-6 w-6" />
                <p class="font-medium">Nothing to show</p>
                <p class="text-sm">Adjust filters to find players.</p>
            </div>
        </template>
        <template #rank-header>
            <div class="text-center">#</div>
        </template>
        <template #rank-cell="{ row }">
            <span class="block w-full text-center">{{ row.getValue('rank') }}</span>
        </template>
        <template #name-header>
            {{ $t('Player') }}
        </template>
        <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
                <UAvatar
                class="hidden md:block" :src="row.original.avatarUrl" alt="Avatar" size="sm"
                icon="i-lucide-user" />
                <span class="truncate text-highlighted max-w-[200px] sm:max-w-none">{{ row.getValue('name') }}</span>
            </div>
        </template>
        <template #mmr-header>
            <div class="text-right">MMR</div>
        </template>
        <template #mmr-cell="{ row }">
            <span class="block text-right tabular-nums font-medium">{{ formatInt(row.getValue('mmr')) }}</span>
        </template>

        <template #games-header>
            <div class="text-right">Games</div>
        </template>
        <template #games-cell="{ row }">
            <span class="block text-right tabular-nums">{{ formatInt(row.getValue('games')) }}</span>
        </template>
        <template #wins-header>
            <div class="text-right">Wins</div>
        </template>
        <template #wins-cell="{ row }">
            <span class="block text-right tabular-nums">{{ formatInt(row.getValue('wins')) }}</span>
        </template>
        <template #winrate-header>
            <div class="text-right">Winrate (%)</div>
        </template>
        <template #winrate-cell="{ row }">
            <span class="block text-right tabular-nums">{{ formatPct(row.getValue('winrate')) }}</span>
        </template>
        <template #favoriteRaceName-header>
            Fav. Race
        </template>
        <template #favoriteRaceName-cell="{ row }">
            <span class="block">{{ row.original.favoriteRaceName || row.getValue('favoriteRaceName') || '—' }}</span>
        </template>
    </UTable>
</template>
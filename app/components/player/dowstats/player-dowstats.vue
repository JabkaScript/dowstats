<script setup lang="ts">
import type { DowStatsResponse, DowStatsPlayerItem } from '~/types/ladder'
import type { TableColumn } from '@nuxt/ui'
import { watch } from 'vue'

interface Props {
  pid: string
  dowstatsData?: DowStatsResponse
}

interface RaceStats {
  raceId: number
  raceName: string
  games: number
  wins: number
  losses: number
  winrate: number | null
}

interface FormatTotal {
  totalGames: number
  totalWins: number
  totalLosses: number
  winrate: number | null
}

// Key type for formats to avoid string indexing errors
type FormatKey = '1v1' | '2v2' | '3v3' | '4v4'

const props = defineProps<Props>()
const { t } = useI18n()

// Narrow type for dynamic stats keys
type StatsShape = DowStatsPlayerItem['stats']
type StatKey = keyof StatsShape

const calcWinrate = (wins: number | null, games: number | null): number | null =>
  games && games > 0 && wins != null ? Math.round((wins / games) * 1000) / 10 : null

// Visual color for winrate bar
const winrateColor = (wr: number | null) => {
  if (wr == null) return 'bg-gray-300'
  return wr >= 60 ? 'bg-emerald-500' : wr >= 50 ? 'bg-amber-500' : 'bg-rose-500'
}

const formatKeys = (
  fmt: 1 | 2 | 3 | 4,
  raceId: number
): { gamesKey: StatKey; winsKey: StatKey } => {
  const gamesKey = `${fmt}X${fmt}${raceId}` as StatKey
  const winsKey = `${fmt}X${fmt}${raceId}W` as StatKey
  return { gamesKey, winsKey }
}

const getRaceLabel = (id: number) => {
  switch (id) {
    case 1:
      return t('race.space_marine')
    case 2:
      return t('race.chaos_marine')
    case 3:
      return t('race.ork')
    case 4:
      return t('race.eldar')
    case 5:
      return t('race.guard')
    case 6:
      return t('race.necron')
    case 7:
      return t('race.tau')
    case 8:
      return t('race.sisters')
    case 9:
      return t('race.dark_eldar')
    default:
      return t('race.all')
  }
}

const stats = computed<StatsShape | undefined>(() => props.dowstatsData?.item?.stats)

const activeTab = ref('1v1')
const sorting = ref<SortingState>([])
watch(activeTab, () => {
  sorting.value = []
})

const makeRaceStats = (fmt: 1 | 2 | 3 | 4): RaceStats[] => {
  const s = stats.value
  if (!s) return []
  const races: RaceStats[] = []
  for (let r = 1; r <= 9; r++) {
    const { gamesKey, winsKey } = formatKeys(fmt, r)
    const games = Number(s[gamesKey] ?? 0)
    const wins = Number(s[winsKey] ?? 0)
    const losses = Math.max(0, games - wins)
    races.push({
      raceId: r,
      raceName: getRaceLabel(r),
      games,
      wins,
      losses,
      winrate: calcWinrate(wins, games),
    })
  }
  return races
}

const formatTotal = (items: RaceStats[]): FormatTotal => {
  const totalGames = items.reduce((sum, r) => sum + r.games, 0)
  const totalWins = items.reduce((sum, r) => sum + r.wins, 0)
  const totalLosses = items.reduce((sum, r) => sum + r.losses, 0)
  return { totalGames, totalWins, totalLosses, winrate: calcWinrate(totalWins, totalGames) }
}

const byFormat = computed<Record<FormatKey, { races: RaceStats[]; total: FormatTotal }>>(() => {
  const solo = makeRaceStats(1)
  const team2 = makeRaceStats(2)
  const team3 = makeRaceStats(3)
  const team4 = makeRaceStats(4)
  return {
    '1v1': { races: solo, total: formatTotal(solo) },
    '2v2': { races: team2, total: formatTotal(team2) },
    '3v3': { races: team3, total: formatTotal(team3) },
    '4v4': { races: team4, total: formatTotal(team4) },
  }
})

const tabItems = computed<{ label: string; value: FormatKey }[]>(() => [
  { label: t('player.match1v1'), value: '1v1' },
  { label: t('player.match2v2'), value: '2v2' },
  { label: t('player.match3v3'), value: '3v3' },
  { label: t('player.match4v4'), value: '4v4' },
])

// No header summary and no custom header sort controls to match Relic style

const columns: TableColumn<RaceStats>[] = [
  { id: 'raceName', accessorKey: 'raceName', header: t('ladder.race') },
  { id: 'games', accessorKey: 'games', header: t('ladder.games') },
  { id: 'wins', accessorKey: 'wins', header: t('ladder.wins') },
  { id: 'losses', accessorKey: 'losses', header: t('ladder.losses') },
  { id: 'winrate', accessorKey: 'winrate', header: t('ladder.winrate') },
]

const loading = computed(() => !props.dowstatsData)
const hasData = computed(() => !!props.dowstatsData?.item?.stats)
</script>

<template>
  <section class="space-y-4">
    <UCard>
      <div v-if="loading" class="space-y-3">
        <USkeleton class="h-6 w-1/3" />
        <USkeleton class="h-6 w-1/2" />
        <USkeleton class="h-24 w-full" />
      </div>

      <div v-else-if="!hasData" class="py-6">
        <UAlert color="info" icon="lucide:info" :title="$t('ladder.nothingToShow')" />
      </div>

      <div v-else>
        <UTabs v-model="activeTab" :items="tabItems" class="w-full" aria-label="Match type">
          <template #content="{ item }">
            <div class="space-y-3">
              <ClientOnly>
                <UTable
                  :data="byFormat[item.value as FormatKey].races"
                  :columns
                  :ui="{
                    td: 'p-1',
                    th: 'p-1',
                    tr: 'even:bg-neutral-100 even:dark:bg-neutral-800',
                    base: 'table-fixed w-full min-w-0 overflow-hidden',
                  }"
                >
                  <template #raceName-cell="{ row }">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ row.original.raceName }}</span>
                    </div>
                  </template>
                  <template #games-header>
                    <div class="text-right">{{ $t('ladder.games') }}</div>
                  </template>
                  <template #wins-header>
                    <div class="text-right">{{ $t('ladder.wins') }}</div>
                  </template>
                  <template #losses-header>
                    <div class="text-right">{{ $t('ladder.losses') }}</div>
                  </template>
                  <template #winrate-header>
                    <div class="text-right">{{ $t('ladder.winrate') }}</div>
                  </template>
                  <template #games-cell="{ row }">
                    <div class="tabular-nums text-right w-full">{{ row.original.games }}</div>
                  </template>
                  <template #wins-cell="{ row }">
                    <div class="tabular-nums text-right w-full">{{ row.original.wins }}</div>
                  </template>
                  <template #losses-cell="{ row }">
                    <div class="tabular-nums text-right w-full">{{ row.original.losses }}</div>
                  </template>
                  <template #winrate-cell="{ row }">
                    <div class="tabular-nums text-right w-full">
                      {{ (row.original.winrate ?? 0).toFixed(2) }}%
                    </div>
                  </template>
                </UTable>
              </ClientOnly>
            </div>
          </template>
        </UTabs>
      </div>
    </UCard>
  </section>
</template>

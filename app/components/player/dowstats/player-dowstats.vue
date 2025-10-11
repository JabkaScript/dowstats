<script setup lang="ts">
import type { DowStatsResponse } from '~/types/ladder'

interface Props {
  pid: string
  dowstatsData?: DowStatsResponse
}

const props = defineProps<Props>()
const { t } = useI18n()

const stats = computed(() => props.dowstatsData?.item?.stats || null)

const num = (v: number | null | undefined) => (typeof v === 'number' ? v : 0)

const formats = [
  { key: '1v1', n: 1, label: '1v1' },
  { key: '2v2', n: 2, label: '2v2' },
  { key: '3v3', n: 3, label: '3v3' },
  { key: '4v4', n: 4, label: '4v4' },
]

const formatTotals = (format: number) => {
  if (!stats.value) return { games: 0, wins: 0, losses: 0, winrate: 0 }
  let games = 0
  let wins = 0
  for (let race = 1; race <= 9; race++) {
    const base = `${format}X${format}${race}` as keyof typeof stats.value
    const winKey = `${format}X${format}${race}W` as keyof typeof stats.value
    games += num((stats.value as any)[base])
    wins += num((stats.value as any)[winKey])
  }
  const losses = Math.max(games - wins, 0)
  const winrate = games > 0 ? Math.round((wins / games) * 1000) / 10 : 0
  return { games, wins, losses, winrate }
}

const overallTotals = computed(() => {
  const totals = formats.map((f) => formatTotals(f.n))
  const games = totals.reduce((s, x) => s + x.games, 0)
  const wins = totals.reduce((s, x) => s + x.wins, 0)
  const losses = Math.max(games - wins, 0)
  const winrate = games > 0 ? Math.round((wins / games) * 1000) / 10 : 0
  return { games, wins, losses, winrate }
})

const mmr = computed(() => {
  const s = stats.value
  return {
    mmr: num(s?.mmr),
    overallMmr: num(s?.overallMmr),
    maxMmr: num(s?.maxMmr),
    maxOverallMmr: num(s?.maxOverallMmr),
    customGamesMmr: num(s?.customGamesMmr),
  }
})

const barWidth = (value: number, total: number) => {
  if (!total || total <= 0) return '0%'
  return `${Math.max(0, Math.min(100, Math.round((value / total) * 100)))}%`
}

// UI helpers
const kpiItems = computed(() => [
  { label: t('ladder.games'), value: overallTotals.value.games.toLocaleString() },
  { label: t('ladder.wins'), value: overallTotals.value.wins.toLocaleString() },
  { label: t('ladder.losses'), value: overallTotals.value.losses.toLocaleString() },
  { label: t('ladder.winrate'), value: `${overallTotals.value.winrate}%` },
])

</script>

<template>
  <section class="space-y-4">
    <div v-if="!stats" class="space-y-2">
      <USkeleton class="h-24 w-full" />
      <USkeleton class="h-36 w-full" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <UCard v-for="item in kpiItems" :key="item.label">
          <div class="text-sm text-neutral-600 dark:text-neutral-300">{{ item.label }}</div>
          <div class="text-xl font-semibold tabular-nums text-neutral-900 dark:text-zinc-100">
            {{ item.value }}
          </div>
        </UCard>
      </div>

      <UCard>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="space-y-1">
            <div class="text-sm text-neutral-600 dark:text-neutral-300">MMR</div>
            <div class="text-lg font-semibold tabular-nums">{{ mmr.mmr }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-neutral-600 dark:text-neutral-300">Overall MMR</div>
            <div class="text-lg font-semibold tabular-nums">{{ mmr.overallMmr }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-neutral-600 dark:text-neutral-300">Max MMR</div>
            <div class="text-lg font-semibold tabular-nums">{{ mmr.maxMmr }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-neutral-600 dark:text-neutral-300">Max Overall</div>
            <div class="text-lg font-semibold tabular-nums">{{ mmr.maxOverallMmr }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-sm text-neutral-600 dark:text-neutral-300">Custom Games MMR</div>
            <div class="text-lg font-semibold tabular-nums">{{ mmr.customGamesMmr }}</div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Formats</h3>
            <span class="text-sm text-neutral-600 dark:text-neutral-300">
              {{ t('ladder.games') }}: {{ overallTotals.games.toLocaleString() }}
            </span>
          </div>
          <div class="space-y-3">
            <div v-for="f in formats" :key="f.key" class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-medium">{{ f.label }}</span>
                <span class="text-sm text-neutral-600 dark:text-neutral-300">
                  {{ t('ladder.games') }}: {{ formatTotals(f.n).games.toLocaleString() }} ·
                  {{ t('ladder.winrate') }}: {{ formatTotals(f.n).winrate }}%
                </span>
              </div>
              <div class="w-full h-3 rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  class="h-3 bg-emerald-500 dark:bg-emerald-600"
                  :style="{ width: barWidth(formatTotals(f.n).wins, formatTotals(f.n).games) }"
                />
                <div
                  class="h-3 bg-rose-400 dark:bg-rose-500"
                  :style="{ width: barWidth(formatTotals(f.n).losses, formatTotals(f.n).games) }"
                />
              </div>
              <div class="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
                <span>{{ t('ladder.wins') }}: {{ formatTotals(f.n).wins.toLocaleString() }}</span>
                <span>{{ t('ladder.losses') }}: {{ formatTotals(f.n).losses.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </section>
</template>

<style scoped>
.w-full.h-3.rounded > div {
  display: inline-block;
}
</style>

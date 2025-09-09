<script setup lang="ts">
import type { Ref } from 'vue'

interface LeaderboardInfo {
  id: number
  name: string
  description?: string
}
interface AvailableLeaderboardsResponse {
  leaderboards: LeaderboardInfo[]
}
interface LeaderboardEntry {
  profileId: number
  statgroup_id: number
  name: string
  rank: number
  gamesPlayed?: number
  wins?: number
  losses?: number
}
interface StatGroupMember {
  profile_id: number
  name?: string
}
interface StatGroup {
  id: number
  type?: string
  members: StatGroupMember[]
}
interface LeaderboardResponse {
  leaderboardStats: LeaderboardEntry[]
  statGroups?: Record<string, StatGroup>
}

const title: Ref<string> = ref('dow1-de')
const leaderboardId: Ref<number | null> = ref(null)
const start: Ref<number> = ref(1)
const count: Ref<number> = ref(50)

const params = computed(() => ({
  title: title.value,
  leaderboard_id: leaderboardId.value ?? undefined,
  start: start.value,
  count: count.value,
}))

const enabled = computed(() => !!leaderboardId.value)

const setPage = (direction: 'prev' | 'next') => {
  const step = count.value
  start.value = direction === 'prev' ? Math.max(1, start.value - step) : start.value + step
}

const winrate = (row: LeaderboardEntry): string => {
  const g = row.gamesPlayed ?? 0
  const w = row.wins ?? 0
  return g ? ((w / g) * 100).toFixed(2) : ''
}

const displayNames = (row: LeaderboardEntry): string => {
  const group = ladder.value?.statGroups?.[String(row.statgroup_id)]
  return group?.members?.length
    ? group.members.map((m) => m.name || String(m.profile_id)).join(' + ')
    : row.name
}

const {
  data: available,
  pending: loadingAvailable,
  error: errorAvailable,
} = await useFetch<AvailableLeaderboardsResponse>(
  '/api/proxy/relic/community/leaderboard/getavailableleaderboards',
  { params: { title } }
)

const leaderboardOptions = computed(() =>
  (available.value?.leaderboards || []).map((l) => ({ label: l.name, value: l.id }))
)

const selectedBoard = computed(() =>
  available.value?.leaderboards.find((l) => l.id === (leaderboardId.value ?? -1))
)

const {
  data: ladder,
  pending: loadingLadder,
  error: errorLadder,
} = await useFetch<LeaderboardResponse>('/api/proxy/relic/community/leaderboard/getleaderboard2', {
  params,
  immediate: false,
  watch: [enabled, params],
})

watch(available, (val) => {
  const first = val?.leaderboards?.[0]?.id
  if (!leaderboardId.value && typeof first === 'number') leaderboardId.value = first
})
</script>

<template>
  <UContainer>
    <h1 class="text-2xl font-semibold mb-4">Relic Ladder</h1>

    <UCard class="mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Игра -->
        <div class="space-y-1">
          <span class="text-sm text-gray-500">Игра</span>
          <UInput v-model="title" placeholder="Напр. dow1-de" />
        </div>

        <div class="space-y-1">
          <span class="text-sm text-gray-500">Таблица</span>
          <USelect
            v-model="leaderboardId"
            :items="leaderboardOptions"
            :disabled="loadingAvailable"
            placeholder="Выберите таблицу"
          />
        </div>

        <!-- Начало -->
        <div class="space-y-1">
          <span class="text-sm text-gray-500">Начало</span>
          <UInput v-model.number="start" type="number" min="1" />
        </div>

        <!-- Кол-во -->
        <div class="space-y-1">
          <span class="text-sm text-gray-500">Кол-во</span>
          <UInput v-model.number="count" type="number" min="1" max="200" />
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <UButton :disabled="!enabled" variant="soft" @click="setPage('prev')">Назад</UButton>
        <UButton :disabled="!enabled" color="primary" @click="setPage('next')">Вперед</UButton>
      </div>
    </UCard>

    <div v-if="selectedBoard" class="mb-4">
      <UAlert
        :title="selectedBoard?.name"
        :description="selectedBoard?.description"
        variant="soft"
      />
    </div>

    <div class="space-y-3">
      <UAlert v-if="loadingAvailable" title="Загрузка списков…" color="primary" variant="soft" />
      <UAlert
        v-else-if="errorAvailable"
        title="Ошибка загрузки списков"
        color="error"
        variant="soft"
      />

      <div v-if="enabled">
        <UAlert v-if="errorLadder" title="Ошибка загрузки рейтинга" color="error" variant="soft" />

        <UCard v-else>
          <UTable
            class="w-full"
            :data="ladder?.leaderboardStats || []"
            :loading="loadingLadder"
            :columns="[
              { id: 'rank', accessorKey: 'rank' },
              { id: 'profileId', accessorKey: 'profileId' },
              { id: 'name', accessorKey: 'name' },
              { id: 'gamesPlayed', accessorKey: 'gamesPlayed' },
              { id: 'wins', accessorKey: 'wins' },
              { id: 'losses', accessorKey: 'losses' },
              { id: 'winrate', accessorKey: 'wins' },
            ]"
          >
            <template #empty>
              <div class="py-8 text-center text-gray-500">Нет данных</div>
            </template>

            <template #rank-header>
              <div class="text-left">#</div>
            </template>
            <template #rank-cell="{ row }">
              <span class="block w-full text-left">{{ row.getValue('rank') }}</span>
            </template>

            <template #profileId-header>
              <div class="text-left">ID</div>
            </template>
            <template #profileId-cell="{ row }">
              <span class="block w-full text-left tabular-nums">
                {{ row.getValue('profileId') }}
              </span>
            </template>

            <template #name-header>
              <div class="text-left">Игрок</div>
            </template>
            <template #name-cell="{ row }">
              <span class="block w-full text-left truncate">{{ displayNames(row.original) }}</span>
            </template>

            <template #gamesPlayed-header>
              <div class="text-right">Игры</div>
            </template>
            <template #gamesPlayed-cell="{ row }">
              <span class="block w-full text-right tabular-nums">
                {{ row.getValue('gamesPlayed') ?? '' }}
              </span>
            </template>

            <template #wins-header>
              <div class="text-right">Победы</div>
            </template>
            <template #wins-cell="{ row }">
              <span class="block w-full text-right tabular-nums">
                {{ row.getValue('wins') ?? '' }}
              </span>
            </template>

            <template #losses-header>
              <div class="text-right">Поражения</div>
            </template>
            <template #losses-cell="{ row }">
              <span class="block w-full text-right tabular-nums">
                {{
                  row.original.losses ??
                  (row.original.gamesPlayed != null && row.original.wins != null
                    ? row.original.gamesPlayed - row.original.wins
                    : '')
                }}
              </span>
            </template>

            <template #winrate-header>
              <div class="text-right">Winrate %</div>
            </template>
            <template #winrate-cell="{ row }">
              <span class="block w-full text-right tabular-nums">{{ winrate(row.original) }}</span>
            </template>
          </UTable>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

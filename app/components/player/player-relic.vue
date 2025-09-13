<script setup lang="ts">
interface Props {
  sid: string
}

interface RelicApiResult {
  code: number
  message: string
}

interface StatGroupMember {
  profile_id: number
  name: string
  alias: string
  personal_statgroup_id: number
  xp: number
  level: number
  leaderboardregion_id: number
  country: string
}

interface StatGroup {
  id: number
  name: string
  type: number
  members: StatGroupMember[]
}

interface LeaderboardStat {
  statgroup_id: number
  leaderboard_id: number
  wins: number
  losses: number
  streak: number
  disputes: number
  drops: number
  rank: number
  ranktotal: number
  ranklevel: number
  rating: number
  regionrank: number
  regionranktotal: number
  lastmatchdate: number
  highestrank: number
  highestranklevel: number
  highestrating: number
}

interface RelicApiResponse {
  result: RelicApiResult
  statGroups: StatGroup[]
  leaderboardStats: LeaderboardStat[]
}
const matchTypes = useMatchTypes()
const tabsItems = computed(() => {
  return Object.values(matchTypes)
    .map((type) => ({
      label: type,
      value: type,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})
const boards = useRelicLeaderboards()
const { t } = useI18n()
const { sid } = defineProps<Props>()
const profileNames = computed(() => {
  return JSON.stringify([`/steam/${sid}`])
})
const { data: relicData } = useFetch<RelicApiResponse>(
  `/api/proxy/relic/community/leaderboard/getpersonalstat?title=dow1-de&profile_names=${profileNames.value}`,
  { server: true, cache: 'default' }
)
const { data: avatar } = useFetch(`/api/v1/players/${sid}/avatar`, { server: true })
const alias = computed(() => relicData?.value?.statGroups[0]?.members[0]?.alias)

const tableColumns = computed(() => {
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

const leaderboardStats = computed(() => {
  if (!relicData?.value?.leaderboardStats) {
    return {}
  }
  return groupLeaderboardStatsByMatchType(relicData?.value?.leaderboardStats)
})

function groupLeaderboardStatsByMatchType(stats: LeaderboardStat[]) {
  const grouped: Record<string, LeaderboardStat[]> = {}
  Object.values(matchTypes).forEach((type) => {
    grouped[type] = []
  })

  stats?.forEach((stat) => {
    const board = boards.find((b) => b.id === stat.leaderboard_id)
    if (board?.leaderboardmap?.[0]) {
      const matchTypeId = board.leaderboardmap[0].matchtype_id
      switch (matchTypeId) {
        case 0:
          grouped['Custom']?.push(stat)
          break
        case 1:
          grouped[matchTypes[1]]?.push(stat)
          break
        case 2:
          grouped[matchTypes[2]]?.push(stat)
          break
        case 3:
          grouped[matchTypes[3]]?.push(stat)
          break
        case 4:
          grouped[matchTypes[4]]?.push(stat)
          break
      }
    }
  })

  return grouped
}

function getBoardName(id: number) {
  return t(formatBoardName(removeMatchType(boards.find((board) => board.id === id)?.name || '')))
}
</script>
<template>
  <UCard class="mb-8">
    <div class="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 p-3 sm:p-2">
      <UAvatar
        :src="avatar"
        :alt="alias || t('player.avatar')"
        size="xl"
        class="w-24 h-24 sm:w-32 sm:h-32 rounded-sm ring-2 ring-primary-500/20 shadow-lg flex-shrink-0"
      />
      <div class="flex-1 space-y-2 text-center sm:text-left">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {{ alias || t('player.unknownPlayer') }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('player.steamId') }}: {{ sid }}</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <UButton
          :to="`https://steamcommunity.com/profiles/${sid}`"
          target="_blank"
          external
          icon="i-simple-icons-steam"
          variant="outline"
          color="primary"
          size="sm"
          class="shrink-0 w-full sm:w-auto"
        >
          {{ t('player.steamProfile') }}
        </UButton>
        <UButton
          :to="`https://dowstats.ru/player.php?sid=${sid}&server=steam&season_id=3`"
          target="_blank"
          variant="outline"
          size="sm"
          icon="lucide:external-link"
          class="shrink-0 w-full sm:w-auto"
        >
          {{ t('player.dowStats') }}
        </UButton>
      </div>
    </div>
  </UCard>

  <UTabs :items="tabsItems" default-value="1v1">
    <template #content="{ item }">
      <div class="overflow-x-auto">
        <UTable :data="leaderboardStats[item.value]" :columns="tableColumns" class="min-w-full">
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
              {{
                ((row.original.wins / (row.original.wins + row.original.losses)) * 100).toFixed(2)
              }}%
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
      </div>
    </template>
  </UTabs>
</template>

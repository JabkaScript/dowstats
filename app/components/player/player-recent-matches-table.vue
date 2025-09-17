<script setup lang="ts">
import type { MatchHistoryStat, StatGroupMember } from '~/types/ladder'

type PlayerItem = { id: number; name: string }

type OpponentGroups = PlayerItem[][]

type UnitType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

const props = defineProps<{
  matches?: MatchHistoryStat[]
  profileId: number
  profiles?: StatGroupMember[]
}>()

const { t, locale } = useI18n()
const matchTypes = useMatchTypes()
const localePath = useLocalePath()
const NuxtLink = resolveComponent('NuxtLink')

const profileById = computed<Map<number, StatGroupMember>>(() => {
  const map = new Map<number, StatGroupMember>()
  for (const p of props.profiles || []) map.set(p.profile_id, p)
  return map
})

const profileNameById = computed<Map<number, string>>(() => {
  const map = new Map<number, string>()
  for (const p of props.profiles || []) map.set(p.profile_id, p.alias || p.name)
  return map
})

function getOutcomeForProfile(stat: MatchHistoryStat, pid: number) {
  const member = stat.matchhistorymember.find((m) => m.profile_id === pid)
  return member?.outcome === 1 ? 'win' : 'loss'
}

function steamIdForProfileId(pid: number): string | null {
  const prof = profileById.value.get(pid)
  if (!prof?.name) return null
  const s = prof.name
  if (s.startsWith('/steam/')) return s.substring('/steam/'.length)
  return null
}

// Конвертация кода страны в emoji-флаг
function flagForCountry(code?: string) {
  if (!code || code.length !== 2) return ''
  const cc = code.toUpperCase()
  const codePoints = [...cc].map((c) => 127397 + c.charCodeAt(0))
  try {
    return String.fromCodePoint(...codePoints)
  } catch {
    return cc
  }
}

// Группируем оппонентов по их командам (поддержка FFA/3+ команд)
function getOpponentGroups(stat: MatchHistoryStat, selfId: number): OpponentGroups {
  // Если есть slotinfo (обычно 2 команды) — используем его
  if (stat.slotinfo?.team1?.length || stat.slotinfo?.team2?.length) {
    const t1 = stat.slotinfo.team1 || []
    const t2 = stat.slotinfo.team2 || []
    const selfInT1 = t1.includes(selfId)
    const opponentIds = selfInT1 ? t2 : t1
    return [opponentIds.map((id) => ({ id, name: profileNameById.value.get(id) || String(id) }))]
  }
  // Иначе строим команды на основе teamid у участников (поддерживает 2+ команд)
  const byTeam = new Map<number, number[]>()
  for (const m of stat.matchhistorymember || []) {
    const arr = byTeam.get(m.teamid) || []
    arr.push(m.profile_id)
    byTeam.set(m.teamid, arr)
  }
  // Определяем команду игрока
  const selfTeamId = stat.matchhistorymember.find((m) => m.profile_id === selfId)?.teamid
  // Собираем оппонентские команды (все, кроме selfTeamId), сортируем по teamid для стабильности
  const opponentTeamIds = Array.from(byTeam.keys())
    .filter((tid) => tid !== selfTeamId)
    .sort((a, b) => a - b)

  const groups: OpponentGroups = opponentTeamIds.map((tid) => {
    const ids = byTeam.get(tid) || []
    return ids.map((id) => ({ id, name: profileNameById.value.get(id) || String(id) }))
  })
  return groups
}

// Список союзников (члены своей команды, кроме себя)
function getAllies(stat: MatchHistoryStat, selfId: number): PlayerItem[] {
  if (stat.slotinfo?.team1?.length || stat.slotinfo?.team2?.length) {
    const t1 = stat.slotinfo.team1 || []
    const t2 = stat.slotinfo.team2 || []
    const selfInT1 = t1.includes(selfId)
    const teamIds = selfInT1 ? t1 : t2
    return teamIds
      .filter((id) => id !== selfId)
      .map((id) => ({ id, name: profileNameById.value.get(id) || String(id) }))
  }
  const byTeam = new Map<number, number[]>()
  for (const m of stat.matchhistorymember || []) {
    const arr = byTeam.get(m.teamid) || []
    arr.push(m.profile_id)
    byTeam.set(m.teamid, arr)
  }
  const selfTeamId = stat.matchhistorymember.find((m) => m.profile_id === selfId)?.teamid
  const ids = (selfTeamId != null ? byTeam.get(selfTeamId) : undefined) || []
  return ids
    .filter((id) => id !== selfId)
    .map((id) => ({ id, name: profileNameById.value.get(id) || String(id) }))
}

// Format duration in M:SS from seconds
function formatDuration(sec?: number) {
  if (!sec || sec <= 0) return '—'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatAbsolute(dt?: Date) {
  if (!dt) return '—'
  const l = isRef(locale) ? (locale.value as unknown as string) : undefined
  return dt.toLocaleString(l, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatRelative(tsMs?: number) {
  if (!tsMs) return ''
  const diffMs = tsMs - Date.now()
  const absMs = Math.abs(diffMs)
  const units: Array<[UnitType, number]> = [
    ['year', 365 * 24 * 60 * 60 * 1000],
    ['month', 30 * 24 * 60 * 60 * 1000],
    ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000],
    ['minute', 60 * 1000],
    ['second', 1000],
  ]
  const found = units.find(([, uMs]) => absMs >= uMs)
  const [unit, msInUnit] = found || units[units.length - 1]
  const value = Math.round(diffMs / msInUnit)
  try {
    const l = isRef(locale) ? (locale.value as unknown as string) : undefined
    const rtf = new Intl.RelativeTimeFormat(l, { numeric: 'auto' })
    return rtf.format(value, unit)
  } catch {
    const v = Math.abs(value)
    const unitMap: Record<UnitType, { one: string; many: string }> = {
      second: { one: 'sec', many: 'secs' },
      minute: { one: 'min', many: 'mins' },
      hour: { one: 'hr', many: 'hrs' },
      day: { one: 'day', many: 'days' },
      month: { one: 'mo', many: 'mos' },
      year: { one: 'yr', many: 'yrs' },
    }
    const label = v === 1 ? unitMap[unit].one : unitMap[unit].many
    return diffMs < 0 ? `${v} ${label} ago` : `in ${v} ${label}`
  }
}

const columns = computed(() => [
  { id: 'date', accessorKey: 'date', header: t('player.date') },
  { id: 'type', accessorKey: 'type', header: t('player.type') },
  { id: 'map', accessorKey: 'map', header: t('player.map') },
  { id: 'opponents', accessorKey: 'opponents', header: t('player.players') },
  { id: 'result', accessorKey: 'result', header: t('player.result') },
  { id: 'duration', accessorKey: 'duration', header: t('player.matchDuration') },
])

const data = computed(() => {
  const rows = (props.matches || []).map((m) => {
    const startMs = m.startgametime ? m.startgametime * 1000 : undefined
    const durationSec = Math.max(0, (m.completiontime ?? 0) - (m.startgametime ?? 0))
    const outcome = getOutcomeForProfile(m, props.profileId)

    const opponentGroups = getOpponentGroups(m, props.profileId)
    const opponentsFlat: PlayerItem[] = opponentGroups.flat()
    const allies = getAllies(m, props.profileId)

    return {
      date: startMs ? formatAbsolute(new Date(startMs)) : '—',
      type: matchTypes[m.matchtype_id as keyof typeof matchTypes] ?? String(m.matchtype_id),
      map: m.mapname || '—',
      opponents: opponentsFlat.map((p) => p.name).join(', '),
      opponentsGroups: opponentGroups,
      allies,
      result: outcome,
      duration: formatDuration(durationSec),
      timestamp: startMs ?? 0,
      relative: startMs ? formatRelative(startMs) : '',
      _raw: m,
    }
  })
  return rows.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
})

// Вспомогательное: текст для тултипа по профилю
function tooltipTextFor(id: number): string {
  const p = profileById.value.get(id)
  if (!p) return ''
  const parts: string[] = []
  const flag = flagForCountry(p.country)
  if (flag) parts.push(flag)
  if (p.country) parts.push(p.country.toUpperCase())
  if (p.level != null) parts.push(`Lv. ${p.level}`)
  if (p.xp != null) parts.push(`${p.xp} XP`)
  return parts.join(' • ')
}
</script>
<template>
  <UTable
    :data="data"
    :columns="columns"
    class="border border-accented rounded-lg bg-default/40 glow-card"
    :ui="{
      td: 'p-2 md:p-3 text-sm',
      th: 'p-2 md:p-3 bg-elevated/80 uppercase tracking-wider text-[11px] text-dimmed',
      tr: 'group odd:bg-elevated/30 even:bg-elevated/50 hover:bg-primary/10 hover:ring-1 hover:ring-primary/15 transition-colors',
    }"
  >
    <template #date-cell="{ row }">
      <div class="flex flex-col">
        <span>{{ row.getValue('date') }}</span>
        <span v-if="row.original.relative" class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ row.original.relative }}
        </span>
      </div>
    </template>

    <template #opponents-cell="{ row }">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
        <div>
          <div class="text-[10px] uppercase tracking-wider text-dimmed mb-1">
            {{ t('player.allies') }}
          </div>
          <div class="flex flex-wrap items-center gap-1">
            <template v-if="row.original.allies?.length">
              <UTooltip
                v-for="p in row.original.allies as PlayerItem[]"
                :key="p.id"
                :text="tooltipTextFor(p.id)"
                :popper="{ placement: 'top' }"
              >
                <UBadge color="primary" variant="subtle" class="px-2 py-0.5 text-xs">
                  <component
                    :is="steamIdForProfileId(p.id) ? NuxtLink : 'span'"
                    :to="
                      steamIdForProfileId(p.id)
                        ? localePath({ name: 'player', params: { id: steamIdForProfileId(p.id) } })
                        : undefined
                    "
                    class="hover:underline"
                  >
                    {{ p.name }}
                  </component>
                </UBadge>
              </UTooltip>
            </template>
            <template v-else>
              <span class="text-neutral-500">—</span>
            </template>
          </div>
        </div>
        <div>
          <div class="text-[10px] uppercase tracking-wider text-dimmed mb-1">
            {{ t('player.opponents') }}
          </div>
          <div class="flex flex-wrap items-center gap-1">
            <template v-if="row.original.opponentsGroups?.length">
              <template v-for="(group, gi) in row.original.opponentsGroups" :key="gi">
                <div class="flex flex-wrap gap-1 items-center">
                  <UTooltip
                    v-for="p in group as PlayerItem[]"
                    :key="p.id"
                    :text="tooltipTextFor(p.id)"
                    :popper="{ placement: 'top' }"
                  >
                    <UBadge color="neutral" variant="subtle" class="px-2 py-0.5 text-xs">
                      <component
                        :is="steamIdForProfileId(p.id) ? NuxtLink : 'span'"
                        :to="
                          steamIdForProfileId(p.id)
                            ? localePath({
                                name: 'player',
                                params: { id: steamIdForProfileId(p.id) },
                              })
                            : undefined
                        "
                        class="hover:underline"
                      >
                        {{ p.name }}
                      </component>
                    </UBadge>
                  </UTooltip>
                </div>
                <span v-if="gi < row.original.opponentsGroups.length - 1" class="mx-1 text-dimmed">
                  ⚔
                </span>
              </template>
            </template>
            <template v-else>
              <span class="text-neutral-500">—</span>
            </template>
          </div>
        </div>
      </div>
    </template>

    <template #result-cell="{ row }">
      <UBadge
        :color="row.getValue('result') === 'win' ? 'success' : 'error'"
        variant="soft"
        size="lg"
        class="font-semibold tracking-wide ring-1 shadow-sm"
        :class="row.getValue('result') === 'win' ? 'ring-success/40' : 'ring-error/40'"
      >
        {{ row.getValue('result') === 'win' ? t('player.victory') : t('player.defeat') }}
      </UBadge>
    </template>

    <template #duration-header>
      <div class="text-right">{{ t('player.matchDuration') }}</div>
    </template>
    <template #duration-cell="{ row }">
      <div class="text-right">{{ row.getValue('duration') }}</div>
    </template>
  </UTable>
</template>

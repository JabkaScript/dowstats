<script setup lang="ts">
import type { MatchHistoryItem, MatchHistoryMember, PlayerProfile } from '~/types/ladder'

interface Props {
  matches?: MatchHistoryItem[]
  profileId: number
  profiles?: PlayerProfile[]
}

const props = defineProps<Props>()
const { t, locale } = useI18n()

const raceSlugById: Record<number, string> = {
  0: 'chaos_marine',
  1: 'dark_eldar',
  2: 'eldar',
  3: 'guard',
  4: 'necron',
  5: 'ork',
  6: 'sisters',
  7: 'space_marine',
  8: 'tau',
}

const getProfileAlias = (pid: number) => {
  const p = props.profiles?.find((x) => x.profile_id === pid)
  return p?.alias || p?.name || `#${pid}`
}

// Extract Steam ID from PlayerProfile.name formatted as "steam/<sid>"
const getSteamIdByProfileId = (pid: number): string | null => {
  const p = props.profiles?.find((x) => x.profile_id === pid)
  const name = p?.name || ''
  const m = name.split('/')
  return m?.[2] || null
}

// Build route to player page using Steam ID
const profileLink = (pid: number) => {
  const sid = getSteamIdByProfileId(pid)
  return sid ? `/player/${sid}` : ''
}

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const formatMapName = (map: string) => {
  // Remove "<n>P_" prefix like "4P_" and normalize underscores
  const cleaned = map.replace(/^\d+P_/i, '').replace(/_/g, ' ')
  return titleCase(cleaned)
}

const formatDateTime = (tsSec?: number) => {
  if (!tsSec) return '-'
  try {
    const dt = new Date(tsSec * 1000)
    return dt.toLocaleString(locale.value)
  } catch {
    return '-'
  }
}

const formatDuration = (start?: number, end?: number) => {
  if (!start || !end || end <= start) return '—'
  const diff = end - start
  const m = Math.floor(diff / 60)
  const s = Math.floor(diff % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const matchTypeLabel = (id?: number) => {
  switch (id) {
    case 1:
      return t('player.match1v1')
    case 2:
      return t('player.match2v2')
    case 3:
      return t('player.match3v3')
    case 4:
      return t('player.match4v4')
    default:
      return t('player.customMatch')
  }
}

const getSelfMember = (m: MatchHistoryItem) =>
  m.matchhistorymember?.find((mm: MatchHistoryMember) => mm.profile_id === props.profileId)

const getTeams = (m: MatchHistoryItem) => {
  const self = getSelfMember(m)
  const teamId = self?.teamid
  const allies =
    m.matchhistorymember?.filter((mm) => mm.teamid === teamId && !isObserverMember(mm)) || []
  const opponents =
    m.matchhistorymember?.filter((mm) => mm.teamid !== teamId && !isObserverMember(mm)) || []
  return { self, allies, opponents }
}

const isVictory = (m: MatchHistoryItem) => {
  const self = getSelfMember(m)
  // Relic API uses outcome = 1 for victory, 2 for loss (based on common conventions)
  return self?.outcome === 1
}
const looksLikeGenericId = (s?: string) => !!s && /^#\d+$/.test(s.trim())
const isObserverMember = (mm: MatchHistoryMember) => {
  const p = props.profiles?.find((x) => x.profile_id === mm.profile_id)
  const alias = p?.alias?.trim()
  const name = p?.name?.trim()
  const generic = (!alias && !name) || looksLikeGenericId(alias) || looksLikeGenericId(name)
  return mm.race_id === 0 && generic
}

// Outcome helpers
const isWinMember = (mm: MatchHistoryMember) => mm.outcome === 1
const outcomeClasses = (mm: MatchHistoryMember) =>
  isWinMember(mm)
    ? 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-100/80 dark:bg-emerald-700/20'
    : 'border-rose-300 dark:border-rose-500/40 bg-rose-100/80 dark:bg-rose-700/20'

const formatDelta = (d: number | null) => {
  if (d === null) return ''
  const sign = d >= 0 ? '+' : ''
  return `${sign} ${d}`
}
const mmrText = (mm: MatchHistoryMember) => {
  const oldR = typeof mm.oldrating === 'number' ? mm.oldrating : null
  const newR = typeof mm.newrating === 'number' ? mm.newrating : null
  if (newR !== null && oldR !== null) return `${newR} ${formatDelta(newR - oldR)}`
  if (newR !== null) return `${newR}`
  if (oldR !== null) return `${oldR}`
  return ''
}

// Average MMR helpers
const ratingValue = (mm: MatchHistoryMember) => {
  const newR = typeof mm.newrating === 'number' ? mm.newrating : null
  const oldR = typeof mm.oldrating === 'number' ? mm.oldrating : null
  return newR ?? oldR ?? null
}

const averageMMR = (members: MatchHistoryMember[]) => {
  const vals = members.map((m) => ratingValue(m)).filter((v): v is number => typeof v === 'number')
  if (vals.length === 0) return null
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.round(avg)
}

const teamAvgs = (m: MatchHistoryItem) => {
  const { allies, opponents } = getTeams(m)
  return {
    allies: averageMMR(allies),
    opponents: averageMMR(opponents),
  }
}

// --- Maps: resolve human-readable name and image from /public/maps ---
const normalizeMapKey = (s?: string) =>
  (s || '').replace(/\$/g, '').trim().toLowerCase().replace(/\s+/g, '_')

const mapsMap = ref<Record<string, string>>({})
const nameToSlug = ref<Record<string, string>>({})
const availableSlugs = ref<Set<string>>(new Set())

onMounted(async () => {
  try {
    const raw = await $fetch<Record<string, string>>('/maps/mapsWithNumKeyCode.json')
    const normalized: Record<string, string> = {}
    for (const [k, v] of Object.entries(raw || {})) {
      normalized[normalizeMapKey(k)] = v
    }
    mapsMap.value = normalized
  } catch {
    mapsMap.value = {}
  }
  try {
    const allMaps = await $fetch<Record<string, string>>('/maps/allMaps.json')
    const rev: Record<string, string> = {}
    for (const [slug, name] of Object.entries(allMaps || {})) {
      rev[(name || '').trim()] = slug
    }
    nameToSlug.value = rev
    availableSlugs.value = new Set(Object.keys(allMaps || {}))
  } catch {
    nameToSlug.value = {}
    availableSlugs.value = new Set()
  }
})

const mapHumanName = (map?: string) => {
  if (!map) return '-'
  const k1 = normalizeMapKey(map)
  const k2 = k1.replace(/^\d+p_/, '')
  return mapsMap.value[k1] || mapsMap.value[k2] || formatMapName(map)
}

const mapImageSrc = (map?: string) => {
  if (!map) return '/maps/default.jpg'
  const k = normalizeMapKey(map)
  const human = mapsMap.value[k] || mapsMap.value[k.replace(/^\d+p_/, '')]
  if (human) {
    const slug = nameToSlug.value[human]
    if (slug) return `/maps/${slug}${slug.endsWith('.jpg') ? '' : '.jpg'}`
  }
  // Try known slugs from allMaps.json
  if (availableSlugs.value.has(k)) return `/maps/${k}.jpg`
  const rawSlug = (map || '').replace(/\$/g, '').trim().toLowerCase()
  if (availableSlugs.value.has(rawSlug)) return `/maps/${rawSlug}.jpg`
  if (rawSlug.includes('_')) {
    const spaceSlug = rawSlug.replace(/_/g, ' ')
    if (availableSlugs.value.has(spaceSlug)) return `/maps/${spaceSlug}.jpg`
  }
  if (rawSlug.includes(' ')) {
    const underscoreSlug = rawSlug.replace(/\s+/g, '_')
    if (availableSlugs.value.has(underscoreSlug)) return `/maps/${underscoreSlug}.jpg`
  }
  // Fallback: normalized slug
  return `/maps/${k}.jpg`
}

// Fallback handling for map thumbnails
const mapImgErrored = ref<Record<string, boolean>>({})
const mapKey = (m: MatchHistoryItem, idx: number) => String(m.id ?? idx)
const mapSrcWithFallback = (m: MatchHistoryItem, idx: number) => {
  const key = mapKey(m, idx)
  if (mapImgErrored.value[key]) return '/maps/default.jpg'
  return mapImageSrc(m.mapname)
}
const onMapImgError = (key: string) => {
  mapImgErrored.value[key] = true
}
</script>

<template>
  <section class="space-y-4">
    <UCard
      v-for="(m, idx) in props.matches || []"
      :key="m.id ?? idx"
      :ui="{ body: 'p-0' }"
      class="overflow-hidden"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div class="flex gap-1 justify-between w-full">
            <div class="flex flex-col items-start gap-2">
              <div class="flex gap-1">
                <UBadge :label="matchTypeLabel(m.matchtype_id)" variant="outline" />
                <UBadge v-if="m.description === 'AUTOMATCH'" label="AUTO" variant="outline" />
              </div>
              <div
                class="flex flex-wrap items-center gap-2 sm:gap-3 text-neutral-600 dark:text-zinc-300"
              >
                <NuxtImg
                  :src="mapSrcWithFallback(m, idx)"
                  :alt="mapHumanName(m.mapname)"
                  width="256"
                  height="256"
                  sizes="(max-width: 640px) 192px, 256px"
                  class="w-32 h-32 rounded-sm ring-1 ring-orange-200/50 dark:ring-orange-500/20 object-cover"
                  @error="onMapImgError(String(m.id ?? idx))"
                />
                <span class="font-bold text-sm sm:text-base">
                  {{ mapHumanName(m.mapname) }}
                </span>

                <span class="opacity-60">•</span>
                <span class="text-xs">
                  {{ t('player.matchDuration') }}:
                  {{ formatDuration(m.startgametime, m.completiontime) }}
                </span>
              </div>
            </div>

            <div>
              <UBadge
                variant="soft"
                :label="`${t('player.date')}: ${formatDateTime(m.completiontime || m.startgametime)}`"
              />
            </div>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div class="pr-3">
          <div class="flex items-center gap-2 mb-2">
            <span
              :class="
                isVictory(m)
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-800 dark:text-rose-300'
              "
              class="font-semibold"
            >
              {{ t('player.allies') }}
            </span>
          </div>
          <ul class="space-y-2">
            <li
              v-for="ally in getTeams(m).allies"
              :key="ally.profile_id"
              class="flex items-center gap-3 px-3 py-2 rounded border"
              :class="[outcomeClasses(ally)]"
            >
              <UAvatar
                :src="`/race-icons/${raceSlugById[ally.race_id]}_race.png`"
                size="md"
                class="rounded-md shadow"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between gap-2">
                  <NuxtLink
                    v-if="profileLink(ally.profile_id)"
                    :to="profileLink(ally.profile_id)"
                    class="text-neutral-900 dark:text-zinc-100 font-medium hover:underline"
                  >
                    {{ getProfileAlias(ally.profile_id) }}
                  </NuxtLink>
                  <span v-else class="text-neutral-900 dark:text-zinc-100 font-medium">
                    {{ getProfileAlias(ally.profile_id) }}
                  </span>
                  <span
                    v-if="mmrText(ally)"
                    :class="
                      isWinMember(ally)
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-rose-800 dark:text-rose-300'
                    "
                    class="text-sm font-semibold text-right"
                  >
                    {{ mmrText(ally) }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div
          class="pl-3 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800"
        >
          <div class="flex items-center gap-2 mb-2">
            <span
              :class="
                isVictory(m)
                  ? 'text-rose-800 dark:text-rose-300'
                  : 'text-emerald-800 dark:text-emerald-300'
              "
              class="font-semibold"
            >
              {{ t('player.opponents') }}
            </span>
          </div>
          <ul class="space-y-2">
            <li
              v-for="opp in getTeams(m).opponents"
              :key="opp.profile_id"
              class="flex items-center gap-3 px-3 py-2 rounded border"
              :class="[outcomeClasses(opp)]"
            >
              <UAvatar
                :src="`/race-icons/${raceSlugById[opp.race_id]}_race.png`"
                size="md"
                class="rounded-sm shadow"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between gap-2">
                  <NuxtLink
                    v-if="profileLink(opp.profile_id)"
                    :to="profileLink(opp.profile_id)"
                    class="text-neutral-900 dark:text-zinc-100 font-medium hover:underline"
                  >
                    {{ getProfileAlias(opp.profile_id) }}
                  </NuxtLink>
                  <span v-else class="text-neutral-900 dark:text-zinc-100 font-medium">
                    {{ getProfileAlias(opp.profile_id) }}
                  </span>
                  <span
                    v-if="mmrText(opp)"
                    :class="
                      isWinMember(opp)
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-rose-800 dark:text-rose-300'
                    "
                    class="text-sm tabular-nums text-right font-semibold"
                  >
                    {{ mmrText(opp) }}
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <div
          class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 text-xs"
        >
          <div class="flex items-center gap-2 text-neutral-700 dark:text-zinc-300">
            <span
              :class="
                isVictory(m)
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-800 dark:text-rose-300'
              "
              class="font-semibold"
            >
              {{ t('player.avgMmrAllies') }}:
              {{ teamAvgs(m).allies ?? '—' }}
            </span>
            <span class="opacity-60">vs</span>
            <span
              :class="
                isVictory(m)
                  ? 'text-rose-800 dark:text-rose-300'
                  : 'text-emerald-800 dark:text-emerald-300'
              "
              class="font-semibold"
            >
              {{ t('player.avgMmrOpponents') }}: {{ teamAvgs(m).opponents ?? '—' }}
            </span>
          </div>
        </div>
      </template>
    </UCard>

    <div v-if="!props.matches || props.matches.length === 0" class="text-center py-8">
      <p class="text-neutral-500 dark:text-zinc-400">{{ t('player.noRecentMatches') }}</p>
    </div>
  </section>
</template>

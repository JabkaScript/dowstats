<script setup lang="ts">
import type { LadderItem, LadderResponse } from '~/types/ladder'

useHead({
  title: 'Ladder | DoW Stats',
})
definePageMeta({
  title: 'Ladder',
  name: 'dowstats-ladder',
})

const { mod, server, season, mmrType } = storeToRefs(useFiltersStore())
const search = ref('')
const searchDebounced = refDebounced(search, 600)

const sort = ref<'asc' | 'desc'>('desc')
const minGames = ref(1)
const showFilters = ref(true)

const page = ref(1)
const pageSize = ref(50)
const items = ref<LadderItem[]>([])
const isLoadingMore = ref(false)

const baseQuery = computed(() => ({
  mod: mod.value,
  server: server.value,
  season: season.value,
  mmrType: mmrType.value,
  search: searchDebounced.value,
  sort: sort.value,
  minGames: minGames.value,
  pageSize: pageSize.value,
}))

const fetchKey = computed(
  () =>
    `ladder:${mod.value}:${server.value}:${season.value}:${mmrType.value}:${sort.value}:${minGames.value}:${pageSize.value}:${searchDebounced.value}`
)

const { data, refresh, pending } = await useFetch<LadderResponse>('/api/v1/ladder', {
  key: fetchKey,
  query: baseQuery,
  watch: false,
  server: true,
})

const total = computed<number | undefined>(() => data.value?.meta?.total)
const totalSafe = computed(() => total.value ?? 0)
const endReached = computed(
  () => typeof total.value === 'number' && items.value.length >= total.value
)
const isInitialLoading = computed(() => pending.value && items.value.length === 0)

const shownFrom = computed(() => (totalSafe.value === 0 ? 0 : items.value.length > 0 ? 1 : 0))
const shownTo = computed(() => Math.min(items.value.length, totalSafe.value))

const loadMore = async () => {
  if (pending.value) return
  if (isLoadingMore.value) return
  if (endReached.value) return
  isLoadingMore.value = true
  try {
    const nextPage = page.value + 1
    const res = await $fetch<LadderResponse>('/api/v1/ladder', {
      params: { ...baseQuery.value, page: nextPage, pageSize: pageSize.value },
    })
    const nextItems: LadderItem[] = res.items
    if (nextItems.length > 0) {
      items.value.push(...nextItems)
      page.value = nextPage
    }
  } finally {
    isLoadingMore.value = false
  }
}

const sentinel = ref<HTMLElement | null>(null)
if (import.meta.client) {
  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      if (
        entry?.isIntersecting &&
        items.value.length > 0 &&
        !pending.value &&
        !isLoadingMore.value
      ) {
        loadMore()
      }
    },
    { root: null, rootMargin: '200px', threshold: 0 }
  )
}

watch(
  () => data.value?.items,
  (newItems) => {
    if (page.value === 1 && Array.isArray(newItems)) {
      items.value = [...newItems]
    }
  },
  { immediate: true }
)

watchDebounced(
  [mod, server, season, mmrType, searchDebounced, sort, minGames, pageSize],
  async () => {
    page.value = 1
    items.value = []
    await refresh()
  },
  { debounce: 300 }
)
</script>

<template>
  <UContainer class="py-4 h-full">
    <UPage>
      <section :aria-label="$t('ladder.filters')" class="mt-2 sticky top-0 z-20">
        <UCard
          variant="subtle"
          class="rounded-2xl shadow-sm backdrop-blur bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/60 dark:border-neutral-800/60"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-sliders" class="h-4 w-4 text-neutral-600 dark:text-zinc-300" />
              <span class="text-sm font-medium text-neutral-700 dark:text-zinc-200">
                {{ $t('ladder.filters') }}
              </span>
            </div>
            <UButton
              :label="showFilters ? $t('ladder.hideFilters') : $t('ladder.showFilters')"
              variant="ghost"
              color="primary"
              icon="lucide:chevron-down"
              :ui="{
                leadingIcon: ['transition-transform', showFilters ? 'rotate-180' : ''],
              }"
              @click="showFilters = !showFilters"
            />
          </div>
          <div
            v-show="showFilters"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 xl:gap-4"
          >
            <UFormField :label="$t('ladder.search')">
              <UInput
                v-model="search"
                class="w-full"
                icon="lucide:search"
                variant="outline"
                size="md"
                :placeholder="$t('ladder.searchPlaceholder')"
              />
            </UFormField>

            <UFormField :label="$t('ladder.mmrType')">
              <LadderSelector v-model="mmrType" class="w-full" />
            </UFormField>

            <UFormField :label="$t('ladder.sort')">
              <USelect
                v-model="sort"
                class="w-full"
                :items="[
                  { label: 'MMR ↓', value: 'desc' },
                  { label: 'MMR ↑', value: 'asc' },
                ]"
              />
            </UFormField>

            <UFormField :label="$t('ladder.mod')">
              <ModSelector v-model="mod" class="w-full" />
            </UFormField>

            <UFormField :label="$t('ladder.season')">
              <SeasonSelector v-model="season" hide-all-seasons class="w-full" />
            </UFormField>

            <UFormField :label="$t('ladder.server')">
              <ServerSelector v-model="server" class="w-full" />
            </UFormField>

            <UFormField :label="$t('ladder.minGames')">
              <UInput v-model.number="minGames" type="number" :min="0" size="md" class="w-full" />
            </UFormField>

            <UFormField :label="$t('ladder.pageSize')">
              <USelect
                v-model="pageSize"
                class="w-full"
                :items="[
                  { label: '25', value: 25 },
                  { label: '50', value: 50 },
                  { label: '100', value: 100 },
                  { label: '200', value: 200 },
                ]"
              />
            </UFormField>
          </div>
          <div v-if="!showFilters" class="flex flex-wrap items-center gap-2 mt-2">
            <UBadge variant="outline" :label="`MMR: ${sort === 'desc' ? '↓' : '↑'}`" />
            <UBadge variant="outline" :label="`${$t('ladder.mmrType')}: ${mmrType}`" />
            <UBadge variant="outline" :label="`${$t('ladder.minGames')}: ${minGames}`" />
            <UBadge variant="outline" :label="`${$t('ladder.pageSize')}: ${pageSize}`" />
            <UBadge v-if="search" variant="soft" :label="`${$t('ladder.search')}: ${search}`" />
          </div>
        </UCard>
      </section>

      <div
        class="flex items-center justify-between py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
      >
        <div>
          <span v-if="isInitialLoading">Loading...</span>
          <span v-else-if="totalSafe">
            {{
              $t('ladder.showingRangeOfTotal', { from: shownFrom, to: shownTo, total: totalSafe })
            }}
          </span>
          <span v-else>{{ $t('ladder.noResults') }}</span>
        </div>
        <div class="hidden sm:flex items-center gap-2" />
      </div>

      <LadderTable
        :data="items"
        :loading="isInitialLoading"
        :ui="{ td: 'p-2 sm:p-3', th: 'p-2 sm:p-3' }"
        :mmr-type="mmrType"
        class="rounded-md border border-neutral-200/60 dark:border-neutral-800/60"
      />

      <div ref="sentinel" />
      <div v-if="pending || isLoadingMore" class="flex justify-center py-6">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <UIcon name="i-lucide-loader-circle" class="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    </UPage>
  </UContainer>
</template>

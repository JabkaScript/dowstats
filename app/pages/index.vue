<script setup lang="ts">
import type { LadderItem, LadderResponse } from '~/types/ladder'

definePageMeta({
  title: 'Ladder',
})

const { mod, server, season, mmrType } = storeToRefs(useFiltersStore())
const search = ref('')
const searchDebounced = refDebounced(search, 1000)

// Infinite scroll state
const page = ref(1)
const pageSize = ref(50)
const items = ref<LadderItem[]>([])
const isLoadingMore = ref(false)
const endReached = computed(() => items.value.length >= (data.value?.meta?.total || 0))

// Base query for initial fetch (page handled manually for infinite loading)
const baseQuery = computed(() => ({
  mod: mod.value,
  server: server.value,
  season: season.value,
  mmrType: mmrType.value,
  search: searchDebounced.value,
  pageSize: pageSize.value,
}))

// Initial fetch (SSR friendly)
const { data, refresh, pending } = await useFetch<LadderResponse>('/api/v1/ladder', {
  query: baseQuery,
})

// Total and shown range derived from accumulated items
const total = computed(() => data.value?.meta?.total || 0)
const shownFrom = computed(() => (total.value === 0 ? 0 : items.value.length > 0 ? 1 : 0))
const shownTo = computed(() => Math.min(items.value.length, total.value))

// Load next page and append
const loadMore = async () => {
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

// Use an intersection observer on a sentinel element
const sentinel = ref<HTMLElement | null>(null)
useIntersectionObserver(
  sentinel,
  ([entry]) => {
    if (entry?.isIntersecting) {
      loadMore()
    }
  },
  { root: null, rootMargin: '200px', threshold: 0 }
)

// Sync accumulated items on first page (filters changed -> reset)
watch(
  () => data.value?.items,
  (newItems) => {
    if (page.value === 1 && Array.isArray(newItems)) {
      items.value = [...newItems]
    }
  },
  { immediate: true }
)

// Reset and refetch when filters/search change
watch([mod, server, season, mmrType, searchDebounced], async () => {
  page.value = 1
  items.value = []
  await refresh()
})
</script>

<template>
  <UContainer class="py-4 h-full">
    <UPage>
      <section :aria-label="$t('ladder.filters')" class="mt-2">
        <UCard variant="subtle">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-3">
            <UInput
              v-model="search"
              class="w-full"
              icon="lucide:search"
              variant="outline"
              :placeholder="$t('ladder.searchPlaceholder')"
            />
            <ModSelector v-model="mod" />
            <ServerSelector v-model="server" />
            <SeasonSelector v-model="season" hide-all-seasons />
            <LadderSelector v-model="mmrType" />
          </div>
        </UCard>
      </section>

      <div
        class="flex items-center justify-between py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400"
      >
        <div>
          <span v-if="total">
            {{ $t('ladder.showingRangeOfTotal', { from: shownFrom, to: shownTo, total }) }}
          </span>
          <span v-else>{{ $t('ladder.noResults') }}</span>
        </div>
        <!-- Removed explicit page indicator for infinite scroll -->
        <div class="hidden sm:flex items-center gap-2" />
      </div>

      <LadderTable
        :data="items"
        :loading="pending && items.length === 0"
        :ui="{ td: 'p-1', th: 'p-1' }"
        :mmr-type="mmrType"
      />

      <div ref="sentinel" />
      <div v-if="!endReached" class="flex justify-center py-6">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <UIcon v-if="isLoadingMore" name="i-lucide-loader-circle" class="h-5 w-5 animate-spin" />
          <span v-if="isLoadingMore">Loading...</span>
        </div>
      </div>
    </UPage>
  </UContainer>
</template>

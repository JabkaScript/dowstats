<script setup lang="ts">
const { mod, server, season, mmrType } = storeToRefs(useFiltersStore())
const search = ref('')
const searchDebounced = refDebounced(search, 1000)
const page = ref(1)
const pageSize = ref(50)

const query = computed(() => ({
  mod: mod.value,
  server: server.value,
  season: season.value,
  mmrType: mmrType.value,
  search: searchDebounced.value,
  page: page.value,
  pageSize: pageSize.value,
}))
const { data, refresh, pending } = await useFetch('/api/v1/ladder', {
  query,
})

const total = computed(() => data.value?.meta?.total || 0)
const shownFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const shownTo = computed(() => Math.min(page.value * pageSize.value, total.value))

watch([mod, server, season, mmrType, searchDebounced], () => {
  page.value = 1
  refresh()
})
watch([page, pageSize], () => refresh())
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
          <span v-if="total">{{ $t('ladder.showingRangeOfTotal', { from: shownFrom, to: shownTo, total }) }}</span>
          <span v-else>{{ $t('ladder.noResults') }}</span>
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <UIcon name="i-lucide-info" class="h-4 w-4" />
          <span>{{ $t('ladder.page', { page }) }}</span>
        </div>
      </div>

      <LadderTable
        :data="data?.items || []"
        :loading="pending"
        :ui="{ td: 'p-1', th: 'p-1' }"
        :mmr-type="mmrType"
      />

      <div class="flex justify-center py-6">
        <UPagination v-model:page="page" :items-per-page="pageSize" :total="total" show-edges />
      </div>
    </UPage>
  </UContainer>
</template>

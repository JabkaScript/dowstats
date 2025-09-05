<script setup lang="ts">
const { mod, server, season, mmrType } = storeToRefs(useFiltersStore())
const search = ref('')
const query = computed(() => ({
  mod: mod.value,
  server: server.value,
  season: season.value,
  mmrType: mmrType.value,
  search: search.value,
}))
const { data, refresh, pending } = await useFetch('/api/v1/ladder', {
  query
})

watch([mod, server, season, mmrType, search], () => (refresh()))
</script>

<template>
  <UContainer class="py-2">
    <UPage>
      <section aria-label="Filters">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-3 p-2 md:p-3 bg-gray-50/60 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-800">
          <UInput v-model="search" class="w-full" icon="lucide:search" variant="outline" placeholder="Search..." />
          <ModSelector v-model="mod" />
          <ServerSelector v-model="server" />
          <SeasonSelector v-model="season" hide-all-seasons />
          <LadderSelector v-model="mmrType" />
        </div>
      </section>
      <LadderTable :data="data?.items || []" :loading="pending" sticky />
    </UPage>
  </UContainer>
</template>
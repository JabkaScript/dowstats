<script setup lang="ts">
const matchTypes = useMatchTypes()
const { t } = useI18n()
const { playerProfileMatchType } = storeToRefs(useFiltersStore())
const items = computed(() => {
  const matchTypesSorted: { label: string; value: string }[] = Object.values(matchTypes)
    .map((type) => ({
      label: type,
      value: type,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
  matchTypesSorted.push({ label: t('player.recent-match'), value: 'recent' })
  return matchTypesSorted
})
</script>
<template>
  <UTabs v-model="playerProfileMatchType" :items>
    <template #content="{ item }">
      <slot v-bind="{ item }" />
    </template>
  </UTabs>
</template>

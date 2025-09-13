<script setup lang="ts">
const matchTypes = useMatchTypes()
const { playerProfileMatchType } = storeToRefs(useFiltersStore())
const items = computed(() => {
  return Object.values(matchTypes)
    .map((type) => ({
      label: type,
      value: type,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})
</script>
<template>
  <UTabs v-model="playerProfileMatchType" :items>
    <template #content="{ item }">
      <slot v-bind="{ item }" />
    </template>
  </UTabs>
</template>

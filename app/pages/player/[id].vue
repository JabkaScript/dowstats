<script setup lang="ts">
const route = useRoute()
const id = route.params.id
const { statsType } = storeToRefs(useFiltersStore())
const items = computed(() => {
  return [
    {
      label: 'Dow Stats',
      value: 'dowstats',
    },
    {
      label: 'Relic',
      value: 'relic',
    },
  ]
})
</script>
<template>
  <UContainer>
    <UPage>
      <UPageHeader class="py-2 mb-2">
        <UTabs v-model="statsType" class="w-fit" :content="false" :items />
      </UPageHeader>
    </UPage>
    <PlayerRelic v-if="statsType === 'relic'" />
  </UContainer>
</template>

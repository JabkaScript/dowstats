<script setup lang="ts">
const route = useRoute()
const sid = route.params.id
const { statsType } = storeToRefs(useFiltersStore())
// const items = computed(() => {
//   return [
//     {
//       label: 'Relic',
//       value: 'relic',
//     },
//     {
//       label: 'Dow Stats',
//       value: 'dowstats',
//       disabled: true,
//     },
//   ]
// })
</script>
<template>
  <UContainer>
    <UPage class="py-2">
      <!-- <UTabs v-model="statsType" variant="link" class="w-fit" :content="false" :items /> -->
      <PlayerRelic v-if="statsType === 'relic'" :sid />
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
const { name } = defineProps<{ name: string }>()
const nameFormatted = computed(() => {
  const nameNormalized = name.replaceAll('_', ' ').replace('race', '').trim()
  switch (nameNormalized) {
    case 'chaos marine':
      return 'Chaos Marines'
    case 'dark eldar':
      return 'Dark Eldars'
    case 'eldar':
      return 'Eldars'
    case 'guard':
      return 'Imperial Guard'
    case 'necron':
      return 'Necrons'
    case 'ork':
      return 'Orks'
    case 'sisters':
      return 'Sisters of Battle'
    case 'space marine':
      return 'Space Marines'
    case 'tau':
      return 'Taus'
    default:
      return nameNormalized
  }
})
</script>
<template>
  <div class="flex gap-2 items-center justify-center">
    <NuxtImg :src="`/race-icons/${name}.png`" class="w-10 h-10 rounded" />
    <div class="w">{{ nameFormatted }}</div>
  </div>
</template>

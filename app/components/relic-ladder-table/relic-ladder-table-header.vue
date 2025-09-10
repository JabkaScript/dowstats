<script setup lang="ts">
const { name } = defineProps<{ name: string }>()
const { t } = useI18n()
const nameFormatted = computed(() => {
  const nameNormalized = name.replaceAll('_', ' ').replace('race', '').trim()
  switch (nameNormalized) {
    case 'chaos marine':
      return t('race.chaos_marine')
    case 'dark eldar':
      return t('race.dark_eldar')
    case 'eldar':
      return t('race.eldar')
    case 'guard':
      return t('race.guard')
    case 'necron':
      return t('race.necron')
    case 'ork':
      return t('race.ork')
    case 'sisters':
      return t('race.sisters')
    case 'space marine':
      return t('race.space_marine')
    case 'tau':
      return t('race.tau')
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

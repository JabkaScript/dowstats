<script setup lang="ts">
const { name, isSingle } = defineProps<{ name: string; isSingle: boolean }>()
const { t } = useI18n()
const nameFormatted = computed(() => {
  return t(formatBoardName(name))
})
</script>
<template>
  <div class="flex gap-2 items-center justify-center" :class="{ '!justify-start': isSingle }">
    <NuxtImg :src="`/race-icons/${name}.png`" class="w-10 h-10 rounded" />
    <div class="w">{{ nameFormatted }}</div>
  </div>
</template>

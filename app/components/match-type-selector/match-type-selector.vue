<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'

const { hideAll } = defineProps<{ hideAll?: boolean }>()
const { t, locale } = useI18n()
const items = computed(() => {
  void locale.value
  const types: SelectItem[] = ['1v1', '2v2', '3v3', '4v4']
  if (!hideAll) types.push({ label: t('All'), value: 'all' })
  return types
})
</script>
<template>
  <USelect :items />
</template>

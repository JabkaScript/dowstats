<script setup lang="ts">
// @todo: add items for other types
const { type } = defineProps<{ type: 'relic_name' | 'relic_number' | 'dowstats' }>()
const { t, locale } = useI18n()
const labels = computed(() => {
  void locale.value
  return {
    csm: t('race.chaos_marine'),
    de: t('race.dark_eldar'),
    eld: t('race.eldar'),
    ork: t('race.ork'),
    guard: t('race.guard'),
    necron: t('race.necron'),
    tau: t('race.tau'),
    sisters: t('race.sisters'),
    sm: t('race.space_marine'),
    all: t('race.all'),
  }
})
const items = computed(() => {
  void locale.value
  switch (type) {
    default:
      return [
        {
          label: labels.value.all,
          value: 'all',
        },
        {
          label: labels.value.sm,
          value: 'space_marine',
        },
        {
          label: labels.value.csm,
          value: 'chaos_marine',
        },
        {
          label: labels.value.eld,
          value: 'eldar',
        },
        {
          label: labels.value.ork,
          value: 'ork',
        },
        {
          label: labels.value.guard,
          value: 'guard',
        },
        {
          label: labels.value.tau,
          value: 'tau',
        },
        {
          label: labels.value.necron,
          value: 'necron',
        },
        {
          label: labels.value.de,
          value: 'dark_eldar',
        },
        {
          label: labels.value.sisters,
          value: 'sisters',
        },
      ]
  }
})
</script>
<template>
  <USelect :items />
</template>

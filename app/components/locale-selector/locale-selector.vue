<script setup lang="ts">
import { ru, en } from '@nuxt/ui/locale'

const { locale, setLocale } = useI18n()

async function updateLocale(locale: 'en' | 'ru') {
  await setLocale(locale)
  await nextTick()
  setTimeout(() => window.location.reload())
}
</script>

<template>
  <ULocaleSelect v-model="locale" :locales="[ru, en]" @update:model-value="updateLocale" />
</template>

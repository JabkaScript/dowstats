<script setup lang="ts">
import { ru, en } from '@nuxt/ui/locale'

const { locale, setLocale } = useI18n()
</script>

<template>
  <ULocaleSelect v-model="locale" :locales="[ru, en]" @update:model-value="setLocale($event)" />
</template>

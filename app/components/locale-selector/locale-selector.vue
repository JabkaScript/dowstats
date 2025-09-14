<script setup lang="ts">
const { locale, setLocale } = useI18n()

const locales = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
]

async function updateLocale(newLocale: 'en' | 'ru') {
  await setLocale(newLocale)
}
</script>

<template>
  <div class="flex items-center gap-1">
    <UButton
      v-for="loc in locales"
      :key="loc.code"
      :variant="locale === loc.code ? 'solid' : 'ghost'"
      :color="locale === loc.code ? 'primary' : 'gray'"
      size="xs"
      class="min-w-0 px-2 py-1"
      @click="updateLocale(loc.code as 'en' | 'ru')"
    >
      <span class="text-xs font-medium">{{ loc.label }}</span>
    </UButton>
  </div>
</template>

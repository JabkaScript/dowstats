<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: t('header.dowstats-ladder'),
    to: localePath({ name: 'dowstats-ladder' }),
    active: String(route.name).includes('dowstats-ladder'),
    icon: 'lucide:bar-chart-3',
  },
  {
    label: t('header.relic-ladder'),
    to: localePath({ name: 'relic-ladder' }),
    active: String(route.name).includes('relic-ladder'),
    icon: 'lucide:shield',
  },
  {
    label: t('header.dowstats'),
    to: 'https://dowstats.ru/index.php?lang=en_US',
    target: '_blank',
    icon: 'lucide:external-link',
  },
  {
    label: t('header.github'),
    to: 'https://github.com/JabkaScript/dowstats',
    target: '_blank',
    icon: 'i-simple-icons-github',
  },
])
</script>

<template>
  <div class="min-h-dvh">
    <UHeader to="/" title="DoW Stats">
      <template #title>
        <div class="flex items-center gap-2">
          <NuxtImg src="rank/rank_first.svg" alt="DoW Stats" width="32" height="32" />
          <span class="font-semibold">DoW Stats</span>
        </div>
      </template>

      <UNavigationMenu :items />

      <template #right>
        <LocaleSelector />
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu :items orientation="vertical" />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>
  </div>
</template>

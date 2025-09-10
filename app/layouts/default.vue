<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const localePath = useLocalePath()
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'DoW Stats Ladder',
    to: localePath({ name: 'dowstats-ladder' }),
    active: String(route.name).includes('dowstats-ladder'),
  },
  {
    label: 'Relic Ladder',
    to: localePath({ name: 'relic-ladder' }),
    active: String(route.name).includes('relic-ladder'),
  },
])

const route = useRoute()
</script>

<template>
  <div class="min-h-dvh">
    <UHeader to="/" title="DoW Stats">
      <template #title>
        <div class="flex items-center gap-2">
          <NuxtImg src="rank/rank_first.svg" alt="DoW Stats" width="32" height="32" />
          <span>DoW Stats</span>
        </div>
      </template>
      <UNavigationMenu :items />

      <template #right>
        <UColorModeButton />

        <UButton
          color="neutral"
          variant="ghost"
          to="https://dowstats.ru/index.php?lang=en_US"
          target="_blank"
          icon="lucide:link"
          aria-label="DowStats (main site)"
        />
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/JabkaScript/dowstats"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />

        <LocaleSelector />
      </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
  </div>
</template>

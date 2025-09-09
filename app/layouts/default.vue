<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Ladder',
    to: '/',
    active: route.path === '/',
  },
  {
    label: 'Relic API',
    to: '/relic-api',
    active: route.path.startsWith('/relic-api'),
  },
])
</script>

<template>
  <div class="min-h-dvh">
    <UHeader to="/" title="DoW Stats">
      <UNavigationMenu :items />

      <template #right>
        <UColorModeButton />
        <LocaleSelector />
      </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
  </div>
</template>

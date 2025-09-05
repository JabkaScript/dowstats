
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Ladder',
    to: '/ladder',
    active: route.path.startsWith('/ladder')
  }
])
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <UHeader to="/" title="DoW Stats" >

      <UNavigationMenu :items />

      <template #right>
        <UColorModeButton />
        <LocaleSelector />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter />
  </div>
</template>

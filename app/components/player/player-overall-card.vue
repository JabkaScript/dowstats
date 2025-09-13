<script setup lang="ts">
interface Props {
  avatarSrc?: string
  name?: string
  aka?: string
}
defineProps<Props>()
</script>
<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2 h-full">
        <UAvatar v-if="avatarSrc" :src="avatarSrc" size="3xl" icon="i-lucide-user" />
        <h2 class="text-xl font-bold">{{ name }}</h2>
        <span v-if="aka" class="text-sm text-gray-500 ml-2">aka: {{ aka }}</span>
      </div>
    </template>
    <template #body>
      <slot />
    </template>
  </UCard>
</template>

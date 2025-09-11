<script setup lang="ts">
const { locale } = useI18n()
</script>
<template>
  <UApp :key="locale">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

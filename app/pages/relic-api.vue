<script setup lang="ts">
import { onMounted } from 'vue'

useHead({
  title: 'Relic API | DoW Stats',
})
definePageMeta({
  title: 'Relic API',
  name: 'relic-api',
})
onMounted(() => {
  import('swagger-ui-dist/swagger-ui.css')
  // @ts-expect-error there is no types for this module
  import('swagger-ui-dist/swagger-ui-bundle').then(({ default: SwaggerUIBundle }) => {
    SwaggerUIBundle({
      url: '/relic-api-docs.yaml',
      dom_id: '#swagger-ui',
      deepLinking: true,
    })
  })
})
</script>

<template>
  <UContainer>
    <div id="swagger-ui" />
  </UContainer>
</template>

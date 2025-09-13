<script setup lang="ts">
interface Props {
  avatar?: string
  alias?: string
  sid?: string
}
defineProps<Props>()
const { t } = useI18n()
</script>
<template>
  <UCard class="mb-8">
    <div class="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 p-3 sm:p-2">
      <UAvatar
        :src="avatar"
        :alt="alias || t('player.avatar')"
        size="xl"
        class="w-24 h-24 sm:w-32 sm:h-32 rounded-sm ring-2 ring-primary-500/20 shadow-lg flex-shrink-0"
      />
      <div class="flex-1 space-y-2 text-center sm:text-left">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {{ alias || t('player.unknownPlayer') }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('player.steamId') }}: {{ sid }}</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <UButton
          :to="`https://steamcommunity.com/profiles/${sid}`"
          target="_blank"
          external
          icon="i-simple-icons-steam"
          variant="outline"
          color="primary"
          size="sm"
          class="shrink-0 w-full sm:w-auto"
        >
          {{ t('player.steamProfile') }}
        </UButton>
        <UButton
          :to="`https://dowstats.ru/player.php?sid=${sid}&server=steam&season_id=3`"
          target="_blank"
          variant="outline"
          size="sm"
          icon="lucide:external-link"
          class="shrink-0 w-full sm:w-auto"
        >
          {{ t('player.dowStats') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

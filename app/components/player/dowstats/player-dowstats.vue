<script setup lang="ts">
import type { DowStatsResponse } from '~/types/ladder'

interface Props {
  dowstatsData?: DowStatsResponse
}
const { dowstatsData } = defineProps<Props>()
</script>
<template>
  <UTable></UTable>
</template>

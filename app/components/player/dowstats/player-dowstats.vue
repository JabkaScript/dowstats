<script setup lang="ts">
import type { DowStatsResponse } from '~/types/ladder'

interface Props {
  dowstatsData: DowStatsResponse | null
}
const { dowstatsData } = defineProps<Props>()
</script>
<template>
  <div></div>
</template>

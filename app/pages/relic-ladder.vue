<script setup lang="ts">
interface Leaderboard {
  id: number
  name: string
  isranked: number
}

const { data } = await useFetch(
  '/api/proxy/relic/community/leaderboard/getavailableleaderboards?title=dow1-de'
)
const matchType = '1v1'
const leaderboards = computed<Leaderboard[]>(
  () =>
    data.value?.leaderboards?.filter(
      (i: Leaderboard) => i.isranked === 1 && i.name.includes(matchType)
    ) || []
)
</script>
<template>
  <UPage>
    <UContainer>
      <div class="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 justify-center py-2">
        <RelicLadderTable
          v-for="leaderboard in leaderboards"
          :key="leaderboard.id"
          :leaderboard-id="leaderboard.id.toString()"
          :name="leaderboard.name"
        />
      </div>
    </UContainer>
  </UPage>
</template>

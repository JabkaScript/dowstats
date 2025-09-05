<script setup lang="ts">
const props = defineProps<{ setActiveSeason?: boolean, hideAllSeasons?: boolean }>()
const model = defineModel<string>();
const { data } = await useFetch('/api/v1/seasons')
const items = computed(() => {
    if (!data.value?.items) return []
    return data.value.items.map((i) => {
        if (props.hideAllSeasons) {
            if (i.seasonName === 'All Seasons') return null
        }
        return {
            id: i.id.toString(),
            name: i.seasonName,
            active: i.isActive,
        }
    }).filter((i) => i !== null)
})

onMounted(() => {
    if (props.setActiveSeason) {
        model.value = items.value.find((i) => i.active)?.id || '1'
    }
})
</script>
<template>
    <USelect v-model="model" :items label-key="name" value-key="id" />
</template>
<script setup lang="ts">
const { data } = await useFetch('/api/v1/servers')

const items = computed(() => {
    if (!data.value?.items) return []
    return data.value.items.map((i) => ({
        id: i.id.toString(),
        name: i.name,
    }))
})
</script>
<template>
    <USelect :items label-key="name" value-key="id" />
</template>
<script setup lang="ts">
const items = [
    {
        id: 'solo',
        name: 'Solo'
    },
    {
        id: 'team',
        name: 'Team'
    },
]
</script>
<template>
    <USelect :items="items" label-key="name" value-key="id" size="md" class="w-full" />
</template>
<script setup lang="ts">
const route = useRoute()
const sectionId = computed(() => String(route.params.sectionId))
</script>

<template>
  <StageWorkspace :section-id="sectionId" />
</template>

<script setup lang="ts">
defineProps<{
  projectTitle: string
}>()
</script>

<template>
  <header class="topbar">
    <div class="topbar__project">
      <span class="topbar__title">{{ projectTitle }}</span>
    </div>
  </header>
</template>

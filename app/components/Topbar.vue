<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <header class="topbar">
    <div class="topbar__project">
      <h1 class="page-title">{{ title }}</h1>
    </div>
  </header>
</template>

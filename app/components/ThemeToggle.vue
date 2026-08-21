<script setup lang="ts">
const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button class="theme-toggle" type="button" @click="toggleTheme">
    {{ theme === 'dark' ? 'Тёмная тема' : 'Светлая тема' }}
  </button>
</template>

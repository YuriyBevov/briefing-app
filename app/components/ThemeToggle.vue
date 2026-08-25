<script setup lang="ts">
const { theme, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    type="button"
    :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
    :title="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
    @click="toggleTheme"
  >
    <BaseIcon class="theme-toggle__icon" :name="theme === 'dark' ? 'sun' : 'moon'" />
  </button>
</template>

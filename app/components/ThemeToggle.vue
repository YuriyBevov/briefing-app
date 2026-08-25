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
    <svg
      v-if="theme === 'dark'"
      class="theme-toggle__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3v2.2" />
      <path d="M12 18.8V21" />
      <path d="M4.6 4.6l1.6 1.6" />
      <path d="M17.8 17.8l1.6 1.6" />
      <path d="M3 12h2.2" />
      <path d="M18.8 12H21" />
      <path d="M4.6 19.4l1.6-1.6" />
      <path d="M17.8 6.2l1.6-1.6" />
      <circle cx="12" cy="12" r="4.2" />
    </svg>
    <svg
      v-else
      class="theme-toggle__icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M20.4 14.4A7.2 7.2 0 0 1 9.6 3.6 8.4 8.4 0 1 0 20.4 14.4Z" />
    </svg>
  </button>
</template>

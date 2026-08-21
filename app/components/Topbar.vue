<script setup lang="ts">
defineProps<{
  projectTitle: string
}>()

const currentTime = ref('')
let timer: ReturnType<typeof window.setInterval> | undefined

const updateTime = () => {
  currentTime.value = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 30000)
})

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <header class="topbar">
    <div class="topbar__project">
      <span class="topbar__title">{{ projectTitle }}</span>
    </div>

    <div class="topbar__actions">
      <time class="topbar__time">{{ currentTime }}</time>
      <button class="button button--secondary" type="button">Выйти</button>
    </div>
  </header>
</template>
